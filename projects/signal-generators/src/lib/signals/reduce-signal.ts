import { CreateSignalOptions, Signal } from '@angular/core';
import { createSignal, SIGNAL } from '@angular/core/primitives/signals';
import { asReadonlyFnFactory, setDebugNameOnNode, setEqualOnNode } from '../internal/utilities';

export interface ReduceSignal<T, U> extends Signal<T> {
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
export function reduceSignal<T, U>(initialValue: T, callbackFn: (prior: T, current: U) => T, options: CreateSignalOptions<T> = {}): ReduceSignal<T, U> {
  const [get, , update] = createSignal(initialValue);
  const $output = get as ReduceSignal<T, U>;
  setDebugNameOnNode(get[SIGNAL], options.debugName);
  setEqualOnNode(get[SIGNAL], options.equal);
  $output.asReadonly = asReadonlyFnFactory($output);
  $output.set = (value: U) => update((prior) => callbackFn(prior, value));
  $output.update = (itemUpdateFn: (prior: T) => U) => update((prior) => callbackFn(prior, itemUpdateFn(prior)));
  return $output;
}
