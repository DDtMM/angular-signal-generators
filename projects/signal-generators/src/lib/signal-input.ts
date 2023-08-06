import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

/** A type that can be converted to a signal with {@link toSignal}. */
export type ToSignalInput<T> = Parameters<typeof toSignal<T>>[0]

/** Could be a function used in a computed, a type compatible with {@link toSignal}, or just a signal. */
export type SignalInput<T> = (() => T) | ToSignalInput<T> | Signal<T>;

/** Extracts the emitted value of a SignalInput */
export type SignalInputValue<T extends SignalInput<unknown>> = T extends SignalInput<infer R> ? R : never;

/** Extracts what the signal would be from a SignalInput */
export type SignalInputSignal<T extends SignalInput<unknown>> = T extends SignalInput<infer R> ? Signal<R> : never;

/**
 * Tests if an object is valid for coerceSignal.
 *
 * @param obj Any type of a value can be checked.
 */
export function isSignalInput(obj: unknown): obj is SignalInput<unknown> {
  return (obj != null) && (typeof obj === 'function' && obj.length === 0 || isToSignalInput(obj));
}

/**
 * Determines if an object is a parameter for toSignalInput by looking for subscribe property.
 * It does this by seeing if there is a subscribe function.
 * If toSignal's implementation changes, then this needs to be reviewed.
 *
 * @param obj Any type of a value can be checked.
 */
export function isToSignalInput<T>(obj: unknown): obj is ToSignalInput<T> {
  return typeof (obj as Partial<ToSignalInput<T>>)?.subscribe === 'function';
}
