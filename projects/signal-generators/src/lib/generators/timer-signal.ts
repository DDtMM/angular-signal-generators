import { DestroyRef, Injector, Signal, assertInInjectionContext, inject, signal } from '@angular/core';
import { CancellableSignal, makeCancellable } from '../internal/cancelable-signal';

export interface TimerSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/** Creates a signal that immediately outputs false, and then outputs true when dueTime is up. */
export function timerSignal(dueTime: number, options?: TimerSignalOptions): CancellableSignal<boolean> {
  const output = signal(false);
  // if there is no injector then determine if we're at least in injector context.
  !options?.injector && assertInInjectionContext(timerSignal);
  const cleanupRef = options?.injector?.get(DestroyRef) ?? inject(DestroyRef);
  const timeoutId = setTimeout(() => output.set(true), dueTime);
  cleanupRef.onDestroy(() => clearTimeout(timeoutId));
  return makeCancellable(output, () => clearTimeout(timeoutId));
}
