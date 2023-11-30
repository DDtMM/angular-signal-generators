import { Injector, Signal, ValueEqualityFn, WritableSignal, computed, signal } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { SignalInput } from '../signal-input';
import { ValueSource } from '../value-source';

export interface FilterSignalOptions<O> {
  /** Equality Check. */
  equal?: ValueEqualityFn<O | undefined>;
  /** This is only used if a signal is created from an observable. */
  injector?: Injector;
}

export interface FilterSignalOptionsWithValue<O> extends Omit<FilterSignalOptions<O>, 'equal'> {
  /** Equality Check. */
  equal?: ValueEqualityFn<O>;
  /** Provide this if the initial value could fail from the guard. */
  initialValidValue: O;
}

export type FilterSignal<T, O = T> = Signal<O> & Omit<WritableSignal<O>, 'set' | 'update'> & {
  /** Sets the new value IF it is compatible with the filter function. */
  set(value: T): void;
  /** Updates the signal's value IF it is compatible with the filter function. */
  update(updateFn: (value: O) => T): void;
};

export function filterSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options: FilterSignalOptionsWithValue<O>): Signal<O>
export function filterSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): Signal<O | undefined>
export function filterSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options: FilterSignalOptionsWithValue<O>): Signal<O>
export function filterSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): Signal<O | undefined>
export function filterSignal<T, O extends T>(initialValue: O, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): FilterSignal<T, O>
export function filterSignal<O>(initialValue: O, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): FilterSignal<O>
/**
 * Filters values from another signal or from values set on directly on the signal.
 * Some overloads allow for a guard function which will change the type of the signal's output value.
 * @example
 * ```ts
 * const nonNegative = filterSignal<number>(0, x => x >= 0);
 * nonNegative.set(-1);
 * console.log(nonNegative()); // 0
 *
 * const input = signal<string>('');
 * // will only update if the length of input is less than 5.
 * const maxLengthFilter = filterSignal(input, x => x.length < 5);
 * // will only update if there are no upper case characters
 * const onlyLowerCaseFilter = filterSignal(input, (x): x is Lowercase<string> => !/[A-Z]/.test(x), { initialValidValue: '' });
 * ```
 * @typeParam T The input value of the signal
 * @typeParam O The output type of the signal or the value of the input and output if no guard function is used.
 * @param source Either a value or a signal.
 * @param filterFn A function that filters values.  Can be a guard function.
 * @param options Options for the signal.
 * @returns A signal.  If a value is passed as source then it will behave like a writable signal.  Otherwise it will be read only.
 */
export function filterSignal<T, O extends T>(source: ValueSource<O>, filterFn: (x: T) => boolean, options: FilterSignalOptions<O> & Omit<Partial<FilterSignalOptionsWithValue<O>>, 'equal'> = {}): Signal<O | undefined> {
  return (isSignalInput(source))
    ? filterSignalFromSignal(source, filterFn, options)
    : filterSignalFromValue(source, filterFn, options);
}

function filterSignalFromValue<T, O extends T>(initialValue: O, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): FilterSignal<T, O>
function filterSignalFromValue<O>(initialValue: O, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): FilterSignal<O>
function filterSignalFromValue<T, O extends T>(initialValue: O, filterFn: (x: T) => boolean, options?: FilterSignalOptions<O>): FilterSignal<T, O> {
  const internal = signal<O>(initialValue, options);
  const setFn = internal.set;

  return Object.assign(internal, {
    set: (x: T) => setConditionally(x),
    update: (signalUpdateFn: (x: T) => T) => setConditionally(signalUpdateFn(internal()))
  });

  function setConditionally(value: T): void {
    if (filterFn(value)) {
      setFn.call(internal, value as O);
    }
  }
}

function filterSignalFromSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options: FilterSignalOptionsWithValue<O>): Signal<O>
function filterSignalFromSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): Signal<O | undefined>
function filterSignalFromSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options: FilterSignalOptionsWithValue<O>): Signal<O>
function filterSignalFromSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): Signal<O | undefined>
function filterSignalFromSignal<T, O extends T>(source: SignalInput<O>, filterFn: (x: T) => boolean, options?: FilterSignalOptions<O> & Omit<Partial<FilterSignalOptionsWithValue<O>>, 'equal'>): Signal<O | undefined> {
  const sourceSignal = coerceSignal(source, options);
  let validValue = !filterFn(sourceSignal()) ? options?.initialValidValue : sourceSignal();
  return computed(() => {
    const currentValue = sourceSignal();
    if (filterFn(currentValue)) {
      validValue = currentValue;
    }
    return validValue;
  }, options);

}

