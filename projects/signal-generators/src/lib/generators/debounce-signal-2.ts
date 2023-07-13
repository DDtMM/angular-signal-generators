import { Signal, signal, effect, inject, DestroyRef, Injector, assertInInjectionContext } from '@angular/core';
import { ComputationOrSignal, toSignal } from '../internal/signal-like';

const enum DebounceSignalState {
  Resting,
  Running
}
export interface DebounceSignalOptions<T> {
  defaultValue?: T;
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

export function debounceSignal2<T>(srcSignal: ComputationOrSignal<T>, dueTimeGenerator: number | ComputationOrSignal<number>, options: DebounceSignalOptions<T>): Signal<T | undefined> {
  const output = signal<T | undefined>(undefined);
  const src = toSignal(srcSignal);
  let state = DebounceSignalState.Resting;
  let lastSignalTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let getRemainingTime: () => number;

  !options?.injector && assertInInjectionContext(debounceSignal2);
  const cleanupRef = options?.injector?.get(DestroyRef) ?? inject(DestroyRef);

  if (typeof dueTimeGenerator === 'number') {
    getRemainingTime = () => dueTimeGenerator - (performance.now() - lastSignalTime);
  }
  else {
    const dueTimeSignal = toSignal(dueTimeGenerator);
    getRemainingTime = () => dueTimeSignal() - (performance.now() - lastSignalTime);
  }

  effect(() => {
    lastSignalTime = performance.now();
    if (state === DebounceSignalState.Resting) {
      timerStart();
    }
    src(); // I wish there was a better way to listen for an update.
  });

  function timerComplete(): void {
    if (getRemainingTime() <= 0) {
      state = DebounceSignalState.Resting;
      output.set(src());
    } else {
      timerStart();
    }
  }

  function timerStart(): void {
    clearTimeout(timeoutId);
    state = DebounceSignalState.Running;
    timeoutId = setTimeout(timerComplete, getRemainingTime());
  }

  cleanupRef.onDestroy(() => {
    clearTimeout(timeoutId);
    state = DebounceSignalState.Resting;
  });

  return output;
}
