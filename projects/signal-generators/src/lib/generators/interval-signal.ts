import { Injector, signal } from '@angular/core';
import { CancellableSignal, makeCancellable } from '../internal/cancelable-signal';
import { getDestroyRef } from '../internal/utilities';

export interface IntervalSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/** Creates a signal that emits a progressively increasing number at the interval of dueTime. */
export function intervalSignal(dueTime: number, options?: IntervalSignalOptions): CancellableSignal<number> {
  let value = 0;
  const output = signal(value);
  const destroyRef = getDestroyRef(intervalSignal, options?.injector);
  const intervalId = setInterval(() => output.set(++value), dueTime);
  destroyRef.onDestroy(() => clearInterval(intervalId));
  return makeCancellable(output, () => clearInterval(intervalId));
}
