import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Could be a function used in a {@link https://angular.dev/api/core/computed | computed },
 * a type compatible with {@link https://angular.dev/api/core/rxjs-interop/toSignal | toSignal},
 * or just a {@link https://angular.dev/api/core/signal | signal}.
 */
export type ReactiveSource<T> = (() => T) | ToSignalInput<T> | Signal<T>;

/** Extracts the emitted value of a {@link ReactiveSource} */
export type ReactiveValue<S extends ReactiveSource<unknown>> = S extends ReactiveSource<infer R> ? R : never;

/** Extracts what the signal would be from a {@link ReactiveSource} */
export type ReactiveSignal<S extends ReactiveSource<unknown>> =
  S extends Signal<unknown>
    ? S /* try get original signal in case it is a writable signal */
    : S extends ReactiveSource<infer R> ? Signal<R> : never;

/** A type that can be converted to a signal with {@link https://angular.dev/api/core/rxjs-interop/toSignal | toSignal}. */
export type ToSignalInput<T> = Parameters<typeof toSignal<T>>[0]

