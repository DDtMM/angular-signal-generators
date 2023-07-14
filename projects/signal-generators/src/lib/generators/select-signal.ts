import { CreateComputedOptions, Signal, computed } from '@angular/core';
import { ComputationOrSignal, coerceSignal } from '../internal/signal-coercion';


export function selectSignal<T, U>(src: ComputationOrSignal<T>, selector: (x: T) => U, options?: CreateComputedOptions<U>): Signal<U> {
  const srcSignal = coerceSignal(src);
  return computed(() => selector(srcSignal()), options);
}
