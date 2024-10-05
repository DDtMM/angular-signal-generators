import { Injector, Signal, effect, isSignal } from '@angular/core';
import { coerceSignal } from './internal/signal-coercion';
import { isSignalInput } from './internal/signal-input-utilities';
import { SignalInput, SignalInputValue } from './signal-input';

/** A constant value or a value that is a SignalInput */
export type ValueSource<T> = T | SignalInput<T>;

/** Extracts the value of the ValueSource */
export type ValueSourceValue<V extends ValueSource<unknown>> = V extends SignalInput<unknown> ? SignalInputValue<V> : V;

/** A function that returns a value.  Could be a signal or just a regular function. */
export type ValueSourceGetValueFn<T> = Signal<T> | (() => T);

/**
 * Creates a function that retrieves the current value from a valueSource.
 * If the value is an isSignalInput like an observable or a function that returns a value, then it will create a signal.
 */
export function createGetValueFn<T>(valueSrc: ValueSource<T>, injector?: Injector): ValueSourceGetValueFn<T> {
  return isSignalInput(valueSrc) ? coerceSignal(valueSrc, { injector }) : () => valueSrc;
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
