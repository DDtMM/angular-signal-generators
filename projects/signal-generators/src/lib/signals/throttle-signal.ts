import { CreateSignalOptions, Injector, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal, signalSetFn } from '@angular/core/primitives/signals';
import { coerceSignal } from '../internal/signal-coercion';
import { isReactive } from '../internal/reactive-source-utilities';
import { TimerInternal } from '../internal/timer-internal';
import { asReadonlyFnFactory, getDestroyRef, setEqualOnNode } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

export interface ThrottleSignalOptions {
  /** Pass an injector if this is not created in an injection context. */
  injector?: Injector;
  /** Emit the first change in each throttle period immediately. Defaults to true. */
  leading?: boolean;
  /** Emit the most recent suppressed value at the end of the period. Defaults to true. */
  trailing?: boolean;
}

export type ThrottledSignal<T> = Signal<T> & Pick<WritableSignal<T>, 'set' | 'update' | 'asReadonly'>;

/**
 * Creates a readonly signal containing throttled changes from a reactive source.
 * @param source The signal-like object whose values are throttled.
 * @param throttleTime The minimum time between emitted values. Can be signal-like.
 * @param options Options for the signal and its leading and trailing emissions.
 * @example
 * ```ts
 * const source = signal(0);
 * const throttleTime = signal(500);
 * const throttled = throttleSignal(source, throttleTime);
 * ```
 */
export function throttleSignal<T>(source: ReactiveSource<T>, throttleTime: ValueSource<number>, options?: ThrottleSignalOptions & Pick<CreateSignalOptions<T>, 'debugName'>): Signal<T>
/**
 * Creates a writable signal whose changes are throttled.
 * @param initialValue The initial value, like a regular signal.
 * @param throttleTime The minimum time between emitted values. Can be signal-like.
 * @param options Options for the signal and its leading and trailing emissions.
 * @example
 * ```ts
 * const throttleTime = signal(500);
 * const throttled = throttleSignal(0, throttleTime);
 * throttled.set(1);
 * ```
 */
export function throttleSignal<T>(initialValue: T, throttleTime: ValueSource<number>, options?: ThrottleSignalOptions & CreateSignalOptions<T>): ThrottledSignal<T>
/**
 * Creates either a writable throttled signal or a readonly signal that throttles a reactive source.
 * By default the first change is emitted immediately and the most recent suppressed change is emitted
 * when the throttle period ends.
 */
export function throttleSignal<T>(
  initialValueOrSource: ValueSource<T>,
  throttleTime: ValueSource<number>,
  options?: ThrottleSignalOptions & CreateSignalOptions<T>
): Signal<T> | ThrottledSignal<T> {
  if (options?.leading === false && options.trailing === false) {
    throw new Error('throttleSignal requires leading or trailing emissions.');
  }
  return isReactive(initialValueOrSource)
    ? createFromReactiveSource(initialValueOrSource, throttleTime, options)
    : createFromValue(initialValueOrSource, throttleTime, options);
}

function createFromReactiveSource<T>(
  sourceInput: ReactiveSource<T>,
  throttleTime: ValueSource<number>,
  options?: ThrottleSignalOptions & CreateSignalOptions<T>
): Signal<T> {
  const timeFn = createGetValueFn(throttleTime, options?.injector);
  const $source = coerceSignal(sourceInput, options);
  const $output = signal(untracked($source), { debugName: options?.debugName });
  const outputNode = ($output as SignalGetter<T>)[SIGNAL];
  const leading = options?.leading ?? true;
  const trailing = options?.trailing ?? true;
  let lastSourceValue = untracked($source);
  let throttling = false;
  let hasTrailingValue = false;

  const timer = new TimerInternal(timeFn(), undefined, {
    onTick: () => {
      throttling = false;
      if (trailing && hasTrailingValue) {
        hasTrailingValue = false;
        signalSetFn(outputNode, untracked($source));
      }
    }
  });
  getDestroyRef(createFromReactiveSource, options?.injector).onDestroy(() => timer.destroy());
  watchValueSourceFn(timeFn, (value) => timer.timeoutTime = value, options?.injector);
  effect(() => {
    const sourceValue = $source();
    if (Object.is(lastSourceValue, sourceValue)) return;
    lastSourceValue = sourceValue;
    if (!throttling) {
      throttling = true;
      hasTrailingValue = !leading;
      if (leading) signalSetFn(outputNode, untracked($source));
      timer.start();
    } else {
      hasTrailingValue = true;
    }
  }, options);
  return $output;
}

function createFromValue<T>(
  initialValue: T,
  throttleTime: ValueSource<number>,
  options?: ThrottleSignalOptions & CreateSignalOptions<T>
): ThrottledSignal<T> {
  const [get, set, update] = createSignal(initialValue);
  setEqualOnNode(get[SIGNAL], options?.equal);
  const $throttled = createFromReactiveSource(get, throttleTime, options) as ThrottledSignal<T>;
  $throttled.asReadonly = asReadonlyFnFactory($throttled);
  $throttled.set = set;
  $throttled.update = update;
  return $throttled;
}
