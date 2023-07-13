import { CreateComputedOptions, Signal, computed } from '@angular/core';
import { ComputationOrSignal, toSignal } from '../internal/signal-like';


export function selectSignal<T, U>(src: ComputationOrSignal<T>, selector: (x: T) => U, options?: CreateComputedOptions<U>): Signal<U> {
  const srcSignal = toSignal(src);
  return computed(() => selector(srcSignal()), options);
}
