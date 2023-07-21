import { Injector, Signal, effect, signal } from '@angular/core';
import { SignalInput, coerceSignal } from '../internal/signal-coercion';
import { getDestroyRef } from '../internal/utilities';
import { TimeSource } from './timer-signal';

const enum DebounceSignalState {
  Resting,
  Running
}
export interface DebounceSignalOptions<T> {
  defaultValue?: T;
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

export function debounceSignal<T>(srcSignal: SignalInput<T>,
  dueTimeSource: TimeSource,
  options: DebounceSignalOptions<T>): Signal<T | undefined> {

  const output = signal<T | undefined>(undefined);
  const src = coerceSignal(srcSignal);
  let state = DebounceSignalState.Resting;
  let lastSignalTime = Number.MAX_SAFE_INTEGER;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let getRemainingTime: () => number;

  const destroyRef = getDestroyRef(debounceSignal, options?.injector);

  if (typeof dueTimeSource === 'number') {
    getRemainingTime = () => dueTimeSource - (performance.now() - lastSignalTime);
  }
  else {
    const dueTimeSignal = coerceSignal(dueTimeSource);
    getRemainingTime = () => dueTimeSignal() - (performance.now() - lastSignalTime);
    effect(() => {
      if (state === DebounceSignalState.Running) {
        timerStart(); // update timer if running.
      }
      dueTimeSignal();
    });
  }

  effect(() => {
    lastSignalTime = performance.now();
    if (state === DebounceSignalState.Resting) {
      timerStart();
    }
    src(); // I wish there was a better way to listen for an update like by a watch function.
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

  destroyRef.onDestroy(() => {
    clearTimeout(timeoutId);
    state = DebounceSignalState.Resting;
  });

  return output;
}
