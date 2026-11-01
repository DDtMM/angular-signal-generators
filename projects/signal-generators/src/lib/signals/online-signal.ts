import { CreateSignalOptions, Injector, Signal, signal } from '@angular/core';
import { getDestroyRef } from '../internal/utilities';

/** Options for {@link onlineSignal}. */
export interface OnlineSignalOptions extends Pick<CreateSignalOptions<unknown>, 'debugName'> {
  /** This is only necessary if called outside an injection context. */
  injector?: Injector;
}

/**
 * Creates a readonly signal that reports the browser's online status.
 * The initial value comes from {@link https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine | navigator.onLine}.
 * Listens to the window's online and offline events until the injection context is destroyed.
 * Returns undefined when window or navigator is unavailable, or navigator.onLine is not supported.
 * An online value does not guarantee that a particular server or the Internet is reachable.
 * @param options Options used when creating the signal. Pass an injector if outside an injection context.
 * @example
 * ```ts
 * const $online = onlineSignal();
 * effect(() => console.log($online())); // true, false, or undefined.
 * ```
 */
export function onlineSignal(options?: OnlineSignalOptions): Signal<boolean | undefined> {
  const target = globalThis.window;
  if (!target || !globalThis.navigator) {
    return signal<boolean | undefined>(undefined, options).asReadonly();
  }

  const destroyRef = getDestroyRef(onlineSignal, options?.injector);
  const $output = signal<boolean | undefined>(globalThis.navigator.onLine, options);
  const onOnline = () => $output.set(true);
  const onOffline = () => $output.set(false);
  target.addEventListener('online', onOnline);
  target.addEventListener('offline', onOffline);
  destroyRef.onDestroy(() => {
    target.removeEventListener('online', onOnline);
    target.removeEventListener('offline', onOffline);
  });
  return $output.asReadonly();
}
