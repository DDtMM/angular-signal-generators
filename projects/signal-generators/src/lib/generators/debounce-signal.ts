import { Signal, signal, effect, inject, DestroyRef, Injector, assertInInjectionContext } from '@angular/core';
import { ComputationOrSignal, coerceSignal } from '../internal/signal-coercion';

const enum DebounceSignalState {
  Resting,
  Running
}
export interface DebounceSignalOptions<T> {
  defaultValue?: T;
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

export function debounceSignal<T>(srcSignal: ComputationOrSignal<T>,
  dueTimeGenerator: number | ComputationOrSignal<number>,
  options: DebounceSignalOptions<T>): Signal<T | undefined> {

  const output = signal<T | undefined>(undefined);
  const src = coerceSignal(srcSignal);
  let state = DebounceSignalState.Resting;
  let lastSignalTime = Number.MAX_SAFE_INTEGER;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let getRemainingTime: () => number;

  !options?.injector && assertInInjectionContext(debounceSignal);
  const cleanupRef = options?.injector?.get(DestroyRef) ?? inject(DestroyRef);

  if (typeof dueTimeGenerator === 'number') {
    getRemainingTime = () => dueTimeGenerator - (performance.now() - lastSignalTime);
  }
  else {
    const dueTimeSignal = coerceSignal(dueTimeGenerator);
    getRemainingTime = () => dueTimeSignal() - (performance.now() - lastSignalTime);
    effect(() => {
      if (state === DebounceSignalState.Running) {
        checkTimerState(); // update timer if running.
      }
      dueTimeSignal();
    });
  }

  effect(() => {
    lastSignalTime = performance.now();
    if (state === DebounceSignalState.Resting) {
      timerStart();
    }
    src(); // I wish there was a better way to listen for an update.
  });

  function checkTimerState(): void {
    if (getRemainingTime() <= 0) {
      state = DebounceSignalState.Resting;
      output.set(src());
    } else {
      timerStart();
    }
  }

  /** Start the timer, clearing the old timer if it was running. */
  function timerStart(): void {
    clearTimeout(timeoutId);
    state = DebounceSignalState.Running;
    timeoutId = setTimeout(checkTimerState, getRemainingTime());
  }

  cleanupRef.onDestroy(() => {
    clearTimeout(timeoutId);
    state = DebounceSignalState.Resting;
  });

  return output;
}
