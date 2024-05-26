import { CreateSignalOptions, Signal } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal, signalUpdateFn } from '@angular/core/primitives/signals';

export type ReduceSignal<T, U> = Signal<T> & {
  asReadonly(): Signal<T>;
  set(value: U): void;
  update(updateFn: (prior: T) => U): void;
};

export function reduceSignal<T>(initialValue: T, callbackFn: (prior: T, current: T) => T, options?: CreateSignalOptions<T>): ReduceSignal<T, T>
export function reduceSignal<T, U>(initialValue: T, callbackFn: (prior: T, current: U) => T, options?: CreateSignalOptions<T>): ReduceSignal<T, U>
/**
 * Creates a WriteableSignal similar to array.reduce:
 * Every time a value is set, callbackFn is run with the previous value to create a new value.
 * @param initialValue The signal's initial value
 * @param callbackFn The callback run when the signal is set that will create its value
 * @param options The equality function that will run after callbackFn
 * @returns A writable signal whose output value is run through the callbackFn.
 * @example
 * ```ts
 * const accumulateValue = reduceSignal(1, (prior, cur) => prior + cur);
 * console.log(accumulateValue()); // 1
 * accumulateValue.set(5);
 * console.log(accumulateValue()); // 6
 * accumulateValue.update(x => x + 1);
 * console.log(accumulateValue()); // 13
 * ```
 */
export function reduceSignal<T, U>(initialValue: T, callbackFn: (prior: T, current: U) => T, options?: CreateSignalOptions<T>): ReduceSignal<T, U> {
  const $output = createSignal(initialValue) as SignalGetter<T> & ReduceSignal<T, U>;
  const outputNode = $output[SIGNAL];
  if (options?.equal) {
    outputNode.equal = options.equal;
  }
  $output.asReadonly = () => $output;
  $output.set = (value: U) => signalUpdateFn(outputNode, (prior) => callbackFn(prior, value));
  $output.update = (itemUpdateFn: (prior: T) => U) => signalUpdateFn(outputNode, (prior) =>  callbackFn(prior, itemUpdateFn(prior)));
  return $output;
}
