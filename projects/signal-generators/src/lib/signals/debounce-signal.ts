import { CreateSignalOptions, Injector, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal, signalSetFn, signalUpdateFn } from '@angular/core/primitives/signals';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { TimerInternal } from '../internal/timer-internal';
import { asReadonlyFnFactory, getDestroyRef } from '../internal/utilities';
import { SignalInput } from '../signal-input';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

export interface DebounceSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/** Almost a writable signal, but restricted to set, update, or asReadonly. */
export type UpdatableSignal<T> = Signal<T> & Pick<WritableSignal<T>, 'set' | 'update' | 'asReadonly'>;

/**
 * Creates a signal which emits the debounced changes from another signal.
 * See the other overload if you want to create a writable signal that is debounced.
 * @param source The signal like object whose values are debounced.
 * @param debounceTime The time from last change before the value is emitted.  Can be signal like.
 * @param options Options for the signal.
 * @example
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
export function debounceSignal<T>(initialValue: T, debounceTime: ValueSource<number>, options?: DebounceSignalOptions & CreateSignalOptions<T>): UpdatableSignal<T>
/**
 * Creates either a writable signal whose values are debounced, or a signal who returns debounced values of another signal.
 */
export function debounceSignal<T>(
  initialValueOrSource: ValueSource<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions & CreateSignalOptions<T>): Signal<T> | UpdatableSignal<T> {

  return isSignalInput(initialValueOrSource)
    ? createFromSignal(initialValueOrSource, debounceTime, options)
    : createFromValue(initialValueOrSource, debounceTime, options)
}

/** Creates a signal that debounces the srcSignal the given debounceTime. */
function createFromSignal<T>(sourceInput: SignalInput<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions): Signal<T> {

  const timerTimeFn = createGetValueFn(debounceTime, options?.injector);
  const $source = coerceSignal(sourceInput, options);
  const $output = signal(untracked($source)) as SignalGetter<T> & WritableSignal<T>;;
  const outputNode = $output[SIGNAL];
  const timer = new TimerInternal(timerTimeFn(), undefined, { onTick: () => signalSetFn(outputNode, untracked($source)) });
  // setup cleanup actions.
  getDestroyRef(createFromSignal, options?.injector).onDestroy(() => timer.destroy());

  watchValueSourceFn(timerTimeFn, (x) => timer.timeoutTime = x, options?.injector);
  effect(() => {
    $source(); // wish there was a better way to watch the value.
    timer.start();
  }, options);
  return $output;
}

/** Creates a writeable signal that updates after a certain amount of time. */
function createFromValue<T>(initialValue: T,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions & CreateSignalOptions<T>): UpdatableSignal<T> {

  const $source = createSignal(initialValue);
  const sourceNode = $source[SIGNAL];
  if (options?.equal) {
    sourceNode.equal = options.equal;
  }

  const $debounced = createFromSignal($source, debounceTime, options) as UpdatableSignal<T>;
  $debounced.asReadonly = asReadonlyFnFactory($debounced);
  $debounced.set = (value: T) => signalSetFn(sourceNode, value);
  $debounced.update = (updateFn) => signalUpdateFn(sourceNode, updateFn);
  return $debounced;
}
