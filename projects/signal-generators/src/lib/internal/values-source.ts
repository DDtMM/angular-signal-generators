import { Injector, Signal, effect, isSignal } from '@angular/core';
import { SignalInput, coerceSignal, isSignalInput } from './signal-coercion';

/** A constant value or a value that is a SignalInput */
export type ValueSource<T> = T | SignalInput<T>;

/** A function that returns a value.  Could be a signal or just a regular function. */
export type ValueSourceGetValueFn<T> = Signal<T> | (() => T);

/** Creates a function that retrieves the current value from a valueSource */
export function valueSourceGetValueFactory<T>(valueSrc: ValueSource<T>): ValueSourceGetValueFn<T> {
  return isSignalInput(valueSrc)
    ? coerceSignal(valueSrc)
    : () => valueSrc;
}
/**
 * Determines if valueSrcFn is a signal, and if it is, creates an effect from callbackFn.
 * Otherwise does nothing since the valueSrc is constant.
 * The factory is used just so the effect callback doesn't need any assertions on valueSrcFn.
 */
export function watchValueSourceFn<T>(valueSrcFn: ValueSourceGetValueFn<T> | null | undefined,
  callback: (x: T) => void,
  injector?: Injector): void {

  if (isSignal(valueSrcFn)) {
    effect(() => callback(valueSrcFn()), { injector: injector });
  }
}
