import { CreateSignalOptions, Signal, WritableSignal, signal } from '@angular/core';
import { SignalInput } from '../signal-input';
import { ValueSource } from '../value-source';
import { CoerceSignalOptions, coerceSignal } from './signal-coercion';
import { isSignalInput } from './signal-input-utilities';


export type ValueSourceSignal<V extends ValueSource<unknown>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V extends Signal<any> ? V // if value source was already a signal then it is just itself.
    : V extends SignalInput<infer T> ? Signal<T> // a plain signal is created from an observable or function returning a value.
      : WritableSignal<V>; // if a value was used as a ValueSource then the signal created is a writable signal.

export function valueSourceToSignal<T, V extends ValueSource<T>>(
  valueSource: V, options?: CoerceSignalOptions<T> & CreateSignalOptions<T>): ValueSourceSignal<V> {

  return isSignalInput<T>(valueSource)
    ? coerceSignal(valueSource, options) as ValueSourceSignal<V>
    : signal(valueSource as T, options) as ValueSourceSignal<V>;
}
