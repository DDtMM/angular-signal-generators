import { Injector, Signal, WritableSignal, effect, signal } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { TimerInternal } from '../internal/timer-internal';
import { getDestroyRef } from '../internal/utilities';
import { SignalInput, isSignalInput } from '../signal-input';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

export interface DebounceSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/** Almost a writable signal, except that mutate is not supported. */
export type UpdatableSignal<T> = Signal<T> & Omit<WritableSignal<T>, 'mutate'>;

/**
 * Creates a signal which emits the debounced changes from another signal.
 * See the other overload if you want to create a writable signal that is debounced.
 * @param source The signal like object whose values are debounced.
 * @param debounceTime The time from last change before the value is emitted.  Can be signal like.
 * @param options Options for the signal.
 * * @example
 * ```ts
 * const original = signal('unchanged');
 * const debounced = debounceSignal(original, 500);
 *
 * original.set('changed');
 * console.log(original(), debounced()) // changed, unchanged
 *
 * setTimeout(() => console.log(original(), debounced()), 500) // changed, changed.
 * ```
 */
export function debounceSignal<T>(source: SignalInput<T>, debounceTime: ValueSource<number>, options?: DebounceSignalOptions): Signal<T>
/**
 * Creates a signal whose changes are debounced after a period of time from when the signal was updated.
 * @param initialValue The initial value like a regular signal.
 * @param debounceTime The time from last change before the value is emitted.  Can be signal like.
 * @param options Options for the signal.
* * @example
 * ```ts
 * const debounced = debounceSignal('unchanged', 500);
 *
 * debounced.set('changed');
 * console.log(debounced()) // unchanged
 *
 * setTimeout(() => console.log(debounced()), 500) // changed
 * ```
 */
export function debounceSignal<T>(initialValue: T, debounceTime: ValueSource<number>, options?: DebounceSignalOptions): UpdatableSignal<T>
/**
 * Creates either a writable signal whose values are debounced, or a signal who returns debounced values of another signal.
 */
export function debounceSignal<T>(
  initialValueOrSource: ValueSource<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions): Signal<T> | UpdatableSignal<T> {

  return isSignalInput(initialValueOrSource)
    ? createSignalDebounce(initialValueOrSource, debounceTime, options)
    : createDebouncedSignal(initialValueOrSource, debounceTime, options)
}

/** Creates a signal that debounces the srcSignal the given debounceTime. */
function createSignalDebounce<T>(source: SignalInput<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions): Signal<T> {

  const timerTimeFn = createGetValueFn(debounceTime, options?.injector);
  const srcSignal = coerceSignal(source, options);
  const output = signal(srcSignal());
  const set = output.set; // in case this gets by createDebouncedSignal.
  const timer = new TimerInternal(timerTimeFn(), undefined, { callback: () => set.call(output, srcSignal()) });
  // setup cleanup actions.
  getDestroyRef(createSignalDebounce, options?.injector).onDestroy(() => timer.destroy());
  watchValueSourceFn(timerTimeFn, (x) => timer.timeoutTime = x, options?.injector);
  effect(() => {
    srcSignal(); // wish there was a better way to watch the value.
    timer.start();
  }, options);
  return output;
}

/** Creates a writeable signal that updates after a certain amount of time. */
function createDebouncedSignal<T>(initialValue: T,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions): UpdatableSignal<T> {

  const source = signal(initialValue);
  const debounced = createSignalDebounce(source, debounceTime, options);

  return Object.assign(debounced, {
    asReadonly: () => debounced,
    // unfortunately mutate didn't work because it changed the underlying value immediately.
    //mutate: source.mutate.bind(source),
    set: (value: T) => source.set(value), // set.call(source, value),
    update: (updateFn: (value: T) => T) => source.update(updateFn)
  });
}
