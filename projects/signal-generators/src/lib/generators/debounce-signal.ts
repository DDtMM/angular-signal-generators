import { Injector, Signal, computed, effect, signal, untracked } from '@angular/core';
import { SignalInput, coerceSignal } from '../internal/signal-coercion';
import { getDestroyRef } from '../internal/utilities';
import { ValueSource, valueSourceGetValueFactory, watchValueSourceFn } from '../internal/values-source';
import { TimerInternal } from '../internal/timer-internal';

export interface DebounceSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/**
 * TODO: Instead of making this use another signal, have it return a writable signal.
 */
export function debounceSignal<T>(srcSignal: SignalInput<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions): Signal<T | undefined> {

  const timerTimeFn = valueSourceGetValueFactory(debounceTime);
  const source = coerceSignal(srcSignal, options);
  const output = signal(source());
  const timer = new TimerInternal(timerTimeFn(), undefined, { callback: () => output.set(source()) });
  // setup cleanup actions.
  getDestroyRef(debounceSignal, options?.injector).onDestroy(() => timer.destroy());
  watchValueSourceFn(timerTimeFn, (x) => timer.timeoutTime = x, options?.injector);
  effect(() => {
    source(); // wish there was a better way to watch the value.
    timer.start();
  }, options)
  return output;
}
