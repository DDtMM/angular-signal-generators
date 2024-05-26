import { CreateSignalOptions, Signal, WritableSignal, signal, untracked } from '@angular/core';
import { SIGNAL, SignalGetter, signalSetFn } from '@angular/core/primitives/signals';

export type FilterSignal<T, O = T> = Signal<O> & {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<O>;
  /** Sets the new value IF it is compatible with the filter function. */
  set(value: T): void;
  /** Updates the signal's value IF it is compatible with the filter function. */
  update(updateFn: (value: O) => T): void;
};


export function filterSignal<T, O extends T>(initialValue: O, filterFn: (x: T) => x is O, options?: CreateSignalOptions<O>): FilterSignal<T, O>
export function filterSignal<O>(initialValue: O, filterFn: (x: O) => boolean, options?: CreateSignalOptions<O>): FilterSignal<O>
/**
 * Filters values set to a directly so that the value only changes when the filter is passed.
 * Some overloads allow for a guard function which will change the type of the signal's output value.
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
  const $output = signal<O>(initialValue, options) as SignalGetter<O> & WritableSignal<O>;
  const outputNode = $output[SIGNAL];

  return Object.assign($output, {
    set: setConditionally,
    update: (signalUpdateFn: (x: T) => T) => setConditionally(signalUpdateFn(untracked($output)))
  });

  function setConditionally(value: T): void {
    if (filterFn(value)) {
      signalSetFn(outputNode, value as O);
    }
  }
}

