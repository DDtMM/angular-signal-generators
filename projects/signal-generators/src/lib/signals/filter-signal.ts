import { CreateSignalOptions, Signal, WritableSignal, signal, untracked } from '@angular/core';

export type FilterSignal<T, O = T> = Signal<O> & Omit<WritableSignal<O>, 'set' | 'update'> & {
  /** Sets the new value IF it is compatible with the filter function. */
  set(value: T): void;
  /** Updates the signal's value IF it is compatible with the filter function. */
  update(updateFn: (value: O) => T): void;
};


export function filterSignal<T, O extends T>(initialValue: O, filterFn: (x: T) => x is O, options?: CreateSignalOptions<O>): FilterSignal<T, O>
export function filterSignal<O>(initialValue: O, filterFn: (x: O) => boolean, options?: CreateSignalOptions<O>): FilterSignal<O>
/**
 * Filters values from another signal or from values set on directly on the signal.
 * Some overloads allow for a guard function which will change the type of the signal's output value.
 * WARNING: When using signals as a source of values there are cases where changes can be skipped.
 * This can occur when multiple changes occur before changeDetection and if the signal is not consumed in between changes.
 * @example
 * ```ts
 * const nonNegative = filterSignal<number>(0, x => x >= 0);
 * nonNegative.set(-1);
 * console.log(nonNegative()); // 0
 * ```
 * @typeParam T The input value of the signal
 * @typeParam O The output type of the signal or the value of the input and output if no guard function is used.
 * @param initialValue The initial value of the signal
 * @param filterFn A function that filters values.  Can be a guard function.
 * @param options Options for the signal.
 * @returns A writable signal whose values are only updated when set.
 */
export function filterSignal<T, O extends T>(initialValue: O, filterFn: (x: T) => boolean, options?: CreateSignalOptions<O>): FilterSignal<T, O> {
  const internal = signal<O>(initialValue, options);
  const setFn = internal.set;

  return Object.assign(internal, {
    set: (x: T) => setConditionally(x),
    update: (signalUpdateFn: (x: T) => T) => setConditionally(signalUpdateFn(untracked(internal)))
  });

  function setConditionally(value: T): void {
    if (filterFn(value)) {
      setFn.call(internal, value as O);
    }
  }
}

