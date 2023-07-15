import { Signal } from '@angular/core';

export interface CancellableSignal<T> extends Signal<T> {
  /** Cancels a signal */
  cancel(): void;
}

/**
 * Adds cancel method to a signal that executes a function when called.
 * Doesn't really cancel anything, just a pretty name.  Maybe this is a dumb idea?
 *
 * @example
 * ```ts
 * function specialSignal(): signal<bool> {
 *   const src = signal(false);
 *   return makeCancellable(src, () => src.set(true));
 * }
 * const isCancelled = specialSignal();
 * console.log(isCancelled()); // false
 * isCancelled.cancel();
 * console.log(isCancelled()); // true
 * ```
 */
export function makeCancellable<T, S extends Signal<T>>(src: S, cancelFn: () => void): S & CancellableSignal<T> {
  return Object.assign(src, { cancel: cancelFn.bind(src) } );
}

