import { computed, CreateSignalOptions, Injector, isSignal, Signal } from '@angular/core';
import { createSignal, SIGNAL, signalSetFn, signalUpdateFn } from '@angular/core/primitives/signals';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { TransformedSignal } from '../internal/transformed-signal';
import { asReadonlyFnFactory } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource } from '../value-source';

/** Options for {@link nestSignal}. */
export interface NestSignalOptions<T> extends CreateSignalOptions<NestSignalValue<T>> {
  /** Needed if not created in injection context and an Subscribable is passed as source. */
  injector?: Injector;
}

/** The value returned by {@link nestSignal} that recursively replaces signals with their value types.  */
export type NestSignalValue<T> = T extends Signal<infer R>
  ? NestSignalValue<R>
  : T extends []
  ? NestSignalValue<T[number]>[]
  : // Begin built in types where we want to control traversal.
  T extends Set<infer R>
  ? Iterable<NestSignalValue<R>> // currently this is just an array, but in the future it could be something else.
  : T extends Map<infer K, infer V>
  ? Iterable<NestSignalValue<K>, NestSignalValue<V>> // currently this is just an array, but in the future it could be something else.
  : T extends Date
  ? T
  : // Objects should be traversed, and remaining non-object types should be returned as-is.
  T extends object
  ? { [K in keyof T]: NestSignalValue<T[K]> }
  : T;

export function nestSignal<T>(source: ReactiveSource<T>, options?: NestSignalOptions<T>): Signal<NestSignalValue<T>>;
export function nestSignal<T>(initialValue: T, options?: NestSignalOptions<T>): TransformedSignal<T, NestSignalValue<T>>;
/**
 * Creates a signal whose value may have several, deeply nested signals.
 * Any time any of the nested signals are updated, the signal will be updated as well.
 * The returned value from the signal will be all of the resolved values from the nested signals.
 * @param source The nest object that contains signals.
 * @param options Options that effect the behavior of the signal.
 * @example
 * ```ts
 * const $count = signal(0);
 * const $text = signal('hello');
 * const $why = signal({ count: computed(() => $count() + 1), text: [$text] })
 * const $nested = nestSignal({ count: $count, text: $text, why: $why });
 * console.log($nested()); // [LOG]: { count: 0, text: 'hello', why: { count: 1, text: ['hello'] } }
 * $count.set(1);
 * console.log($nested()); // [LOG]: { count: 1, text: 'hello', why: { count: 2, text: ['hello'] } }
 * ```
 */
export function nestSignal<T>(
  source: ValueSource<T>,
  options?: NestSignalOptions<T>
): Signal<NestSignalValue<T>> | TransformedSignal<T, NestSignalValue<T>> {
  return isReactive(source) ? createFromReactiveSource(source, options) : createFromValue(source, options);
}

function createFromReactiveSource<T>(
  reactiveSource: ReactiveSource<T>,
  options?: NestSignalOptions<T>
): Signal<NestSignalValue<T>> {
  const $input = coerceSignal(reactiveSource, options);
  return computed(() => deNest($input()), options);
}

function createFromValue<T>(initialValue: T, options?: NestSignalOptions<T>): TransformedSignal<T, NestSignalValue<T>> {
  const $source = createSignal(initialValue);
  const sourceNode = $source[SIGNAL];
  const $unwrapped = computed(() => deNest($source()), options) as TransformedSignal<T, NestSignalValue<T>>;
  $unwrapped.asReadonly = asReadonlyFnFactory($unwrapped);
  $unwrapped.set = (value: T) => signalSetFn(sourceNode, value);
  $unwrapped.update = (updateFn: (value: T) => T) => signalUpdateFn(sourceNode, updateFn);
  return $unwrapped;
}
/** Recursively converts and signals in a value into their values. */
function deNest<T>(input: T): NestSignalValue<T> {
  if (isSignal(input)) {
    return deNest(input()) as NestSignalValue<T>;
  } else if (Array.isArray(input)) {
    return input.map(deNest) as NestSignalValue<T>;
  } else if (input instanceof Set) {
    const result: unknown[] = [];
    input.forEach((value) => result.push(deNest(value)));
    return result as NestSignalValue<T>;
  } else if (input instanceof Map) {
    const result: [unknown, unknown][] = [];
    input.forEach((value, key) => result.push([deNest(key), deNest(value)]));
    return result as NestSignalValue<T>;
  } else if (input instanceof Date) {
    return input as NestSignalValue<T>;
  } else if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, deNest(value)])) as NestSignalValue<T>;
  } else {
    return input as NestSignalValue<T>;
  }
}
