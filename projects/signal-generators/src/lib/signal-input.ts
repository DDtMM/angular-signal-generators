import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

/** A type that can be converted to a signal with {@link toSignal}. */
export type ToSignalInput<T> = Parameters<typeof toSignal<T>>[0]

/** Could be a function used in a computed, a type compatible with {@link toSignal}, or just a signal. */
export type SignalInput<T> = (() => T) | ToSignalInput<T> | Signal<T>;

/** Extracts the emitted value of a {@link SignalInput} */
export type SignalInputValue<S extends SignalInput<unknown>> = S extends SignalInput<infer R> ? R : never;

/** Extracts what the signal would be from a {@link SignalInput} */
export type SignalInputSignal<S extends SignalInput<unknown>> =
  S extends Signal<unknown>
    ? S /* try get original signal in case it is a writable signal */
    : S extends SignalInput<infer R> ? Signal<R> : never;


