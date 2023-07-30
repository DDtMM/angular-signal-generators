import { Signal, computed, isSignal, signal } from '@angular/core';

export interface RefValue<T> {
  readonly ref: T;
}
export type ReadonlyRefSignal<T> = Signal<RefValue<T>>;

export interface RefSignal<T> extends ReadonlyRefSignal<T>  {
  asReadonly: () => ReadonlyRefSignal<T>;
  mutate: (mutatorFn: (value: T) => void) => void;
  set: (value: T) => void;
  update: (updateFn: (value: T) => T) => void;
}

/** Makes sure a reference to the latest value is always returned from a signal. */
export function refSignal<T>(src: Signal<T>): ReadonlyRefSignal<T>
/** Wraps values in RefValue so even if the same value is emitted it will be not equal. */
export function refSignal<T>(initialValue: T): RefSignal<T>
export function refSignal<T>(initialValueOrSignal: T | Signal<T>): RefSignal<T> | ReadonlyRefSignal<T> {
  if (isSignal(initialValueOrSignal)) {
    return computed(() => ({ ref: initialValueOrSignal() }), { equal: () => false });
  }
  const innerSignal = signal<RefValue<T>>({ ref: initialValueOrSignal });
  const { update, set } = innerSignal;
  return Object.assign(innerSignal, {
    asReadonly: () => innerSignal,
    mutate: (mutatorFn: (value: T) => void) => update.call(innerSignal, ({ ref }) => {
      mutatorFn(ref);
      return { ref };
    }),
    set: (value: T) => set.call(innerSignal, { ref: value }),
    update: (updateFn: (value: T) => T) => update.call(innerSignal, x => ({ ref: updateFn(x.ref) }))
  });
}
