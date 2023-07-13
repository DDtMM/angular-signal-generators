import { Signal, WritableSignal } from '@angular/core';

export interface CancellableSignal<T> extends Signal<T> {
  /** Cancels a signal */
  cancel(): void;
}

/** Adds cancel method to a signal */
export function makeCancellable<T, S extends Signal<T>>(src: S, cancelFn: () => void): S & CancellableSignal<T> {
  return Object.assign(src, { cancel: cancelFn.bind(src) } );
}

