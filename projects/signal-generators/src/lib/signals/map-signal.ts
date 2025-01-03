import { CreateSignalOptions, Injector, Signal, ValueEqualityFn, WritableSignal, computed, signal } from '@angular/core';
import { SIGNAL, SignalGetter, signalSetFn, signalUpdateFn } from '@angular/core/primitives/signals';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { TransformedSignal } from '../internal/transformed-signal';
import { asReadonlyFnFactory } from '../internal/utilities';
import { ReactiveSignal, ReactiveSource, ReactiveValue } from '../reactive-source';

/** Options for {@link mapSignal}. */
export interface MapSignalOptions<R> extends Pick<CreateSignalOptions<R>, 'debugName'> {
  /** An equal function put on the selector result. */
  equal?: ValueEqualityFn<R>;
  /** This is only used if toSignal is needed to convert to a signal OR to get destroyedRef. */
  injector?: Injector;
}
/** A signal that is updated with TIn, but emits TOut due to a selector specified at creation. */
export interface MapSignal<TIn, TOut> extends TransformedSignal<TIn, TOut> {
  /**
   * Contains the values that are input to the signal.
   * Calling set or update on this will have the same behavior as calling the main set or update methods
   * and is exposed to make it easier for binding.
   */
  input: WritableSignal<TIn>;
}
/** Used for when one or more signals passed as parameters */
export type FromReactiveTupleType<T = unknown> = readonly ReactiveSource<T>[];
/** Extracts the values from a tuple of signal and converts them into a tuple of their own. */
export type FromReactiveValues<T extends FromReactiveTupleType> = { [I in keyof T]: ReactiveValue<T[I]> };
/** Creates a selector function type that uses the tuple of values as parameters */
export type FromReactiveSelector<T extends FromReactiveTupleType, R> = (...x: FromReactiveValues<T>) => R;
/** Extracts the signal value in a signal input type */
type FromReactiveSignals<T extends FromReactiveTupleType> = { [I in keyof T]: ReactiveSignal<T[I]> };
/** The function parameters if signals are being passed without options. */
type FromReactiveParameters<T extends FromReactiveTupleType, R> = readonly [ ...inputs: T, selector: FromReactiveSelector<T, R>];
/** The function parameters if signals are being passed with options.  Using an optional tuple member produced weird results. */
type FromReactiveParametersWithOptions<T extends FromReactiveTupleType, R> = readonly [
  ...inputs: T,
  selector: FromReactiveSelector<T, R>,
  options: MapSignalOptions<R>
];
/** The function parameters if a value is passed.  This definition is only needed to simplify the implementation function.*/
type FromValueParameters<T, R> = readonly [initialValue: T, selector: (x:T) => R, options?: MapSignalOptions<R> ];

/**
 * Creates a signal from one or more signals that are mapped using the selector function.
 * This is slightly different from compute as all values will be recalculated even if logic in the selector only uses some.
 * @typeParam T The type of the signal tuple portion of params.
 * @typeParam R The type of the value output by the selector function
 * @param params One or more signals, then the selector.
 * @returns A readonly signal emitting the selector value
 * @example
 * ```ts
 * const num1 = signal(0);
 * const num2 = signal(1);
 * const num3 = signal(2);
 * const mapped = mapSignal(num1, num2, num3, (a, b, c) => a + b + c);
 * console.log(mapped()); // 3
 * num1.set(5);
 * console.log(mapped()); // 8
 * ```
 */
export function mapSignal<const T extends FromReactiveTupleType, R>(...params: FromReactiveParameters<T, R> | FromReactiveParametersWithOptions<T, R>): Signal<R>
/**
 * Creates a signal whose input value is immediately mapped to a different value based on a selector.
 * The selector can contain signals and will react to changes in those signals.
 * @typeParam T The type of the initial value
 * @typeParam R The type of the value output by the selector function
 * @param initialValue The initial value that will be run
 * @param selector A selector that is run after the value of the signal is changed.
 * @param options Can see equality function or if the selector or injector since this uses a computed function.
 * @returns A writable signal whose output value is mapped with the selector.
 * @example
 * ```ts
 * const addOne = mapSignal(1, x => x + 1);
 * console.log(addOne()); // 2
 *
 * const addOnePlusOne = mapSignal(1, x => x + addOne());
 * console.log(addOnePlusOne()); // 3
 * ```
 */
export function mapSignal<T, R>(initialValue: T, selector: (x:T) => R, options?: MapSignalOptions<R>): MapSignal<T, R>
export function mapSignal<T, R, const TTpl extends T extends FromReactiveTupleType ? T : never, TVal extends T extends FromReactiveTupleType ? never : T>(
  ...params: FromReactiveParameters<TTpl, R> | FromReactiveParametersWithOptions<TTpl, R> | FromValueParameters<TVal, R>):
  Signal<R> | MapSignal<TVal, R> {

  if (params.length < 2) {
    throw new Error('Invalid param count.  At least two are required.');
  }

  return (isFromReactiveParameters(params))
    ? createFromReactiveParameters(...params)
    : createFromValue(params[0], params[1], params[2]);


  function isFromReactiveParameters(value: typeof params): value is FromReactiveParameters<TTpl, R> | FromReactiveParametersWithOptions<TTpl, R>{
    return isReactive(value[0])
  }
}

/** Creates a readonly signal that selects from one or more signals. */
function createFromReactiveParameters<T extends FromReactiveTupleType, R>(...params: FromReactiveParameters<T, R> | FromReactiveParametersWithOptions<T, R>): Signal<R> {
  const { inputs, options, selector } = destructureParams();

  return computed(() => selector(...inputs.map(x => x()) as FromReactiveValues<T>), options);

  function destructureParams(): { inputs: FromReactiveSignals<T>, selector: FromReactiveSelector<T, R>, options: MapSignalOptions<R>} {
    let options: MapSignalOptions<R>;
    let endOffset: number;
    if (hasOptions(params)) {
      options = params[params.length - 1] as MapSignalOptions<R>;
      endOffset = 2;
    }
    else {
      options = {};
      endOffset = 1;
    }
    return {
      inputs: (params.slice(0, params.length - endOffset) as [...T]).map(x => coerceSignal(x, options)) as FromReactiveSignals<T>,
      options,
      selector: params[params.length - endOffset] as FromReactiveSelector<T, R>
    };
  }
  function hasOptions(value: typeof params): value is FromReactiveParametersWithOptions<T, R> {
    // relies on both selector being a function, so if the last element isn't a function then it must be options.
    return typeof value[value.length - 1] !== 'function';
  }
}
/** Creates a new signal that runs selector after every value change. */
function createFromValue<T, R>(initialValue: T, selector: (x:T) => R, options: MapSignalOptions<R> = {}): MapSignal<T, R> {
  const $input = signal<T>(initialValue) as SignalGetter<T> & WritableSignal<T>;
  const inputNode = $input[SIGNAL];
  const $output = computed(() => selector($input()), options) as MapSignal<T, R>;
  $output.asReadonly = asReadonlyFnFactory($output);
  $output.input = $input;
  $output.set = (value: T) => signalSetFn(inputNode, value);
  $output.update = (updateFn: (value: T) => T) => signalUpdateFn(inputNode, updateFn);
  return $output;
}

