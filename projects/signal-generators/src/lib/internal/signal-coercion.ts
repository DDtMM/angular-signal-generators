import { Signal, computed, isSignal } from '@angular/core';

/** Could be a function used in a computed or a signal. */
export type ComputationOrSignal<T> = () => T;

/** If source is a signal, it is returned, otherwise it's turned into a computed signal. */
export function coerceSignal<T>(source: ComputationOrSignal<T>): Signal<T> {
  return (isSignal(source)) ? source : computed(source);
}
