import { CreateSignalOptions, Injector, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal, signalSetFn } from '@angular/core/primitives/signals';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { TimerInternal } from '../internal/timer-internal';
import { asReadonlyFnFactory, getDestroyRef, setEqualOnNode } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

export interface DebounceSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

/**
 * A writable signal whose value changes are debounced by a configured time period.
 * @privateRemarks
 * This could have been just a WriteableSignal, but I'm concerned about any confusion created by the fact
 * that the SIGNAL symbol comes from a different signal than what the write functions are writing to.
 */
export type DebouncedSignal<T> = Signal<T> & Pick<WritableSignal<T>, 'set' | 'update' | 'asReadonly'>;

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
export function debounceSignal<T>(source: ReactiveSource<T>, debounceTime: ValueSource<number>, options?: DebounceSignalOptions & Pick<CreateSignalOptions<T>, 'debugName'>): Signal<T>
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
export function debounceSignal<T>(initialValue: T, debounceTime: ValueSource<number>, options?: DebounceSignalOptions & CreateSignalOptions<T>): DebouncedSignal<T>
/**
 * Creates either a writable signal whose values are debounced, or a signal who returns debounced values of another signal.
 */
export function debounceSignal<T>(
  initialValueOrSource: ValueSource<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions & CreateSignalOptions<T>): Signal<T> | DebouncedSignal<T> {

  return isReactive(initialValueOrSource)
    ? createFromReactiveSource(initialValueOrSource, debounceTime, options)
    : createFromValue(initialValueOrSource, debounceTime, options)
}

/** Creates a signal that debounces the srcSignal the given debounceTime. */
function createFromReactiveSource<T>(sourceInput: ReactiveSource<T>,
  debounceTime: ValueSource<number>,
  options?: DebounceSignalOptions & CreateSignalOptions<T>): Signal<T> {

  // QUESTION: Why are we explicitly ignore the options.equal function for the reactive source version?
  // We are even omitting it from the overload of the main function.
  // Is it because the equal function is running on the source signal in the value version?
  const timerTimeFn = createGetValueFn(debounceTime, options?.injector);
  const $source = coerceSignal(sourceInput, options);
  const $output = signal(untracked($source), { debugName: options?.debugName });
  const outputNode = ($output as SignalGetter<T>)[SIGNAL];
  const timer = new TimerInternal(timerTimeFn(), undefined, { onTick: () => signalSetFn(outputNode, untracked($source)) });
  // setup cleanup actions.
  getDestroyRef(createFromReactiveSource, options?.injector).onDestroy(() => timer.destroy());

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
  options?: DebounceSignalOptions & CreateSignalOptions<T>): DebouncedSignal<T> {

  const [get, set, update] = createSignal(initialValue);
  setEqualOnNode(get[SIGNAL], options?.equal);
  const $debounced = createFromReactiveSource(get, debounceTime, options) as DebouncedSignal<T>;
  $debounced.asReadonly = asReadonlyFnFactory($debounced);
  $debounced.set = set;
  $debounced.update = update;
  return $debounced;
}
