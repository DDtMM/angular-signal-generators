import { Injector, Signal, effect, isSignal } from '@angular/core';
import { coerceSignal } from './internal/signal-coercion';
import { isReactive } from './internal/reactive-source-utilities';
import { ReactiveSource, ReactiveValue } from './reactive-source';

/**
 * A constant value or a {@link ReactiveSource}.
 * @typeParam T The type of the value or the type emitted by the {@link ReactiveSource}.
 */
export type ValueSource<T> = T | ReactiveSource<T>;

/** Extracts the value of the {@link ValueSource}. */
export type ValueSourceValue<V extends ValueSource<unknown>> = V extends ReactiveSource<unknown> ? ReactiveValue<V> : V;

/** A function that returns a value.  Could be a signal or just a regular function. */
export type ValueSourceGetValueFn<T> = Signal<T> | (() => T);

/**
 * Creates a function that retrieves the current value from a {@link ValueSource}.
 * If the value is an {@link ReactiveSource} like an observable or a function that returns a value, then it will create a signal,
 * otherwise it will return a function that just returns a value.
 */
export function createGetValueFn<T>(valueSrc: ValueSource<T>, injector?: Injector): ValueSourceGetValueFn<T> {
  return isReactive(valueSrc) ? coerceSignal(valueSrc, { injector }) : () => valueSrc;
}
/**
 * Determines if valueSrcFn is a signal, and if it is, creates an effect from callbackFn.
 * Otherwise does nothing since the valueSrc is constant.
 * The factory is used just so the effect callback doesn't need any assertions on valueSrcFn.
 */
export function watchValueSourceFn<T>(
  valueSrcFn: ValueSourceGetValueFn<T> | null | undefined,
  callback: (x: T) => void,
  injector?: Injector
): void {
  if (isSignal(valueSrcFn)) {
    effect(() => callback(valueSrcFn()), { injector: injector, manualCleanup: true });
  }
}
