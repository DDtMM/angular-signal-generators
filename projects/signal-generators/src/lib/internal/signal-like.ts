import { Signal, computed, isSignal } from '@angular/core';

/** Could be a function used in a computed or a signal. */
export type ComputationOrSignal<T> = () => T;

export function toSignal<T>(source: ComputationOrSignal<T>): Signal<T> {
  return (isSignal(source)) ? source : computed(source);
}
