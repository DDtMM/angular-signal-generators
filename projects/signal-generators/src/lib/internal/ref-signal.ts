import { Signal, signal } from '@angular/core';

export interface RefValue<T> {
  readonly ref: T;
}
export type ReadonlyRefSignal<T> = Signal<RefValue<T>>;

export interface RefSignal<T> extends ReadonlyRefSignal<T>  {
  asReadonly: () => ReadonlyRefSignal<T>;
  set: (value: T) => void;
  update: (updateFn: (value: T) => T) => void;
}

/** Wraps values in RefValue so even if the same value is emitted it will be not equal. */
export function refSignal<T>(initialValue: T): RefSignal<T> {
  const innerSignal = signal<RefValue<T>>({ ref: initialValue });
  const { update, set } = innerSignal;
  return Object.assign(innerSignal, {
    asReadonly: () => innerSignal,
    set: (value: T) => set.call(innerSignal, { ref: value }),
    update: (updateFn: (value: T) => T) => update.call(innerSignal, x => ({ ref: updateFn(x.ref) }))
  });
}
