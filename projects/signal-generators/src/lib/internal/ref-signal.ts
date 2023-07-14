import { Signal, computed } from '@angular/core';

export interface RefValue<T> {
  ref: T;
}
/** Makes sure a reference to the latest value is always returned. */
export function refSignal<T>(src: Signal<T>): Signal<RefValue<T>> {
  return computed(() => ({ ref: src() }), { equal: () => false });
}
