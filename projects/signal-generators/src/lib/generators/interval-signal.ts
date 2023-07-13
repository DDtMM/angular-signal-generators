import { DestroyRef, Injector, Signal, assertInInjectionContext, inject, signal, untracked } from '@angular/core';
import { CancellableSignal, makeCancellable } from '../internal/cancelable-signal';

export interface IntervalSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/** Creates a signal that emits a progressively increasing number at the interval of dueTime. */
export function intervalSignal(dueTime: number, options?: IntervalSignalOptions): CancellableSignal<number> {
  let value = 0;
  const output = signal(value);
  // if there is no injector then determine if we're at least in injector context.
  !options?.injector && assertInInjectionContext(intervalSignal);
  const cleanupRef = options?.injector?.get(DestroyRef) ?? inject(DestroyRef);
  const intervalId = setInterval(() => output.set(++value), dueTime);
  cleanupRef.onDestroy(() => clearInterval(intervalId));
  return makeCancellable(output, () => clearInterval(intervalId));
}
