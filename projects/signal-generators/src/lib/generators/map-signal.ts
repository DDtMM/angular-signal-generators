/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injector, Signal, ValueEqualityFn, computed, signal } from '@angular/core';
import { SignalInputValue, SignalInput, SignalInputSignal, isSignalInput } from '../signal-input';
import { coerceSignal } from '../internal/signal-coercion';

export interface MapSignalOptions<R>  {
  /**
   * An equal function put on the selector result.
   * This won't behave quite the same if the signal is tracked.
   * This is because the equality function will only work on emitted values for tracked values based om how computed works.
   * For untracked, it's always run after each change.
   */
  equal?: ValueEqualityFn<R>;
  /** This is only used if toSignal is needed to convert to a signal OR to get destroyedRef. */
  injector?: Injector;
}
/** A signal that is updated with TIn, but emits TOut due to a selector specified at creation. */
export interface MapSignal<TIn, TOut> extends Signal<TOut> {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<TOut>;
  /** Contains the values that are input to the signal. */
  input: Signal<TIn>;
  mutate(mutatorFn: (value: TIn) => void): void;
  set(value: TIn): void;
  update(updateFn: (value: TIn) => TIn): void;
}
/** Used for when one or more signals passed as parameters */
export type FromSignalTupleType<T = unknown> = readonly SignalInput<T>[];
/** Extracts the values from a tuple of signal and converts them into a tuple of their own. */
export type FromSignalValues<T extends FromSignalTupleType> = { [I in keyof T]: SignalInputValue<T[I]> };
/** Creates a selector function type that uses the tuple of values as parameters */
export type FromSignalSelector<T extends FromSignalTupleType, R> = (x: FromSignalValues<T>) => R;
/** Extracts the signal value in a signal input type */
type FromSignalInputSignals<T extends FromSignalTupleType> = { [I in keyof T]: SignalInputSignal<T[I]> };
type FromSignalParameters<T extends FromSignalTupleType, R> = readonly [
  ...inputs: T,
  selector: FromSignalSelector<T, R>
];
type FromSignalParametersWithOptions<T extends FromSignalTupleType, R> = readonly [
  ...inputs: T,
  selector: FromSignalSelector<T, R>,
  options: MapSignalOptions<R>
];
type FromValueParameters<T, R> = readonly [initialValue: T, selector: (x:T) => R, options?: MapSignalOptions<R> ];
/**
 * Creates a signal whose input value is immediately mapped to a different value based on a selector.
 * The selector can contain signals, and when **trackSelector** is *true* in **options**, will react to changes in those signals.
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
 *
 * addOne.set(2);
 * console.log(addOnePlusOne()); // 3 - no change because the selector is not reactive.
 * addOnePlusOne.set(2)
 * console.log(addOnePlusOne()); // 5 = 2 + (2 + 1)
 *
 * const addOnePlusOneTracked = mapSignal(1, x => x + addOne(), { trackSelector: true });
 * console.log(addOnePlusOneTracked); // 4
 * addOne.set(3);
 * console.log(addOnePlusOneTracked); // 5
 * ```
 */
export function mapSignal<T, R>(initialValue: T, selector: (x:T) => R, options?: MapSignalOptions<R>): MapSignal<T, R>
/**
 * Creates a signal from one or more signals that are mapped using the selector function.
 * This is slightly different
 * The selector can contain signals, and when **trackSelector** is *true* in **options**, will react to changes in those signals.
 * @typeParam T The type of the signal tuple portion of params.
 * @typeParam R The type of the value output by the selector function
 * @param params One or more signals, then the selector.
 * @returns A readonly signal emitting the selector value
 * @example
 * ```ts
 * const num1 = signal(0);
 * const num2 = signal(1);
 * const num3 = signal(2);
 * const mapped = mapSignal(num1, num2, num3, ([a, b, c]) => a + b + c);
 * console.log(mapped()); // 3
 * num1.set(5);
 * console.log(mapped()); // 7
 * ```
 */
export function mapSignal<T extends FromSignalTupleType, R>(...params: FromSignalParameters<T, R>): Signal<R>
/**
 * Creates a signal from one or more signals that are mapped using the selector function.
 * This is slightly different
 * The selector can contain signals, and when **trackSelector** is *true* in **options**, will react to changes in those signals.
 * @typeParam T The type of the signal tuple portion of params.
 * @typeParam R The type of the value output by the selector function
 * @param params One or more signals, then the selector, then optional options.
 * @returns A readonly signal emitting the selector value
 * @example
 * ```ts
 * const num1 = signal(0);
 * const num2 = signal(1);
 * const num3 = signal(2);
 * const mapped = mapSignal(num1, num2, num3, ([a, b, c]) => a + b + c, { equals: (a, b) => false });
 * console.log(mapped()); // 3
 * num1.set(5);
 * console.log(mapped()); // 7
 * ```
 */
export function mapSignal<T extends FromSignalTupleType, R>(...params: FromSignalParametersWithOptions<T, R>): Signal<R>
export function mapSignal<T, R, TTpl extends T extends FromSignalTupleType ? T : never, TVal extends T extends FromSignalTupleType ? never : T>(
  ...params: FromSignalParameters<TTpl, R> | FromSignalParametersWithOptions<TTpl, R> | FromValueParameters<TVal, R>):
  Signal<R> | MapSignal<TVal, R> {

  if (params.length < 2) {
    throw new Error('Invalid param count.  At least two are required.');
  }

  return (isFromSignalParameters(params))
    ? mapSignalFromSignal(...params)
    : mapSignalFromValue(params[0], params[1], params[2]);


  function isFromSignalParameters(value: typeof params): value is FromSignalParameters<TTpl, R> | FromSignalParametersWithOptions<TTpl, R>{
    return isSignalInput(value[0])
  }
}

/** Creates a new signal that runs selector after every value change. */
function mapSignalFromValue<T, R>(initialValue: T, selector: (x:T) => R, options: MapSignalOptions<R> = {}): MapSignal<T, R> {
  const input = signal<T>(initialValue);
  const output = computed(() => selector(input()), { equal: options.equal });
  return Object.assign(output, {
    asReadonly: () => output,
    input,
    mutate: input.mutate.bind(input),
    set: input.set.bind(input),
    update: input.update.bind(input)
  });
}

/** Creates a readonly signal that selects from one or more signals. */
function mapSignalFromSignal<T extends FromSignalTupleType, R>(...params: FromSignalParameters<T, R> | FromSignalParametersWithOptions<T, R>): Signal<R> {
  const { inputs, options, selector } = destructureParams();

  return computed(() => selector(inputs.map(x => x()) as FromSignalValues<T>), options);

  function destructureParams(): { inputs: FromSignalInputSignals<T>, selector: FromSignalSelector<T, R>, options: MapSignalOptions<R>} {
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
      inputs: (params.slice(0, params.length - endOffset) as [...T]).map(x => coerceSignal(x, options)) as FromSignalInputSignals<T>,
      options,
      selector: params[params.length - endOffset] as FromSignalSelector<T, R>
    };
  }
  function hasOptions(value: typeof params): value is FromSignalParametersWithOptions<T, R> {
    // relies on both selector being a function, so if the last element isn't a function then it must be options.
    return typeof value[value.length - 1] !== 'function';
  }
}
