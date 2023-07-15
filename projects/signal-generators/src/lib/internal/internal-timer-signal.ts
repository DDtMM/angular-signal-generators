import { DestroyRef, Injector, Signal, assertInInjectionContext, effect, inject, signal } from '@angular/core';
import { CancellableSignal, makeCancellable } from '../internal/cancelable-signal';
import { SignalInput, coerceSignal } from './signal-coercion';
import { getDestroyRef } from './utilities';

export interface TimerSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

export type TimeSource = number | SignalInput<number>;
/** Creates a signal that immediately outputs false, and then outputs true when dueTime is up. */
export function internalTimerSignal(initialTime: TimeSource,
  intervalTime?: TimeSource, options?: TimerSignalOptions): CancellableSignal<number> {

  const destroyRef = getDestroyRef(internalTimerSignal, options?.injector);
  let lastCompleteTime = performance.now();
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let getRemainingTime: () => number;
  let currentDurationSource: TimeSource | undefined = initialTime;
  const output = signal(0);

  updateGetRemainingTime();

  destroyRef.onDestroy(destroy);
  return makeCancellable(output, destroy);

  function checkTimerState(): void {
    const remainingTime = getRemainingTime();
    if (remainingTime <= 0) {
      lastCompleteTime = performance.now() + remainingTime;
      currentDurationSource = intervalTime;
      output.set(Math.random() * 10000); // placeholder
    }
    timerStart();
  }

  function destroy() {
    clearTimeout(timeoutId);
    currentDurationSource = undefined;
  }
  /** Start the timer, clearing the old timer if it was running. */
  function timerStart(): void {
    clearTimeout(timeoutId);
    if (currentDurationSource) {
      timeoutId = setTimeout(checkTimerState, getRemainingTime());

    }
  }
  function updateGetRemainingTime() {
    if (!currentDurationSource) {
      return;
    }
    if (typeof currentDurationSource === 'number') {
      const dueTime = currentDurationSource;
      getRemainingTime = () => dueTime - (performance.now() - lastCompleteTime);
    }
    else {
      const dueTimeSignal = coerceSignal(currentDurationSource);
      getRemainingTime = () => dueTimeSignal() - (performance.now() - lastCompleteTime);
      effect(() => {
        timerStart();
        dueTimeSignal();
      });
    }
  }
}
