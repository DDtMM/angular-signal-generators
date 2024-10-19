import { isSignal } from '@angular/core';
import { ReactiveSource, ToSignalInput } from '../reactive-source';

export function isReactive<T>(obj: ReactiveSource<T> | T): obj is ReactiveSource<T>
export function isReactive(obj: unknown): obj is ReactiveSource<unknown>
/**
 * Tests if an object is valid for coerceSignal and meets the criteria for being a {@link ReactiveSource}.
 *
 * @param obj Any type of a value can be checked.
 */
export function isReactive(obj: unknown): obj is ReactiveSource<unknown> {
  return (obj != null) && (isSignal(obj) || isReactiveSourceFunction(obj) || isToSignalInput(obj));
}

export function isReactiveSourceFunction<T>(obj: ReactiveSource<T>): obj is () => T
export function isReactiveSourceFunction(obj: unknown): obj is () => unknown
/** Is true if obj is a function, it has no arguments, and it is not a signal. */
export function isReactiveSourceFunction(obj: unknown): obj is () => unknown {
  return typeof obj === 'function' && obj.length === 0 && !isSignal(obj);
}

export function isToSignalInput<T>(obj: ReactiveSource<T>): obj is ToSignalInput<T>
export function isToSignalInput(obj: unknown): obj is ToSignalInput<unknown>
/**
 * Determines if an object is a parameter for toSignal by looking for subscribe property.
 * It does this by seeing if there is a subscribe function.
 * If toSignal's implementation changes, then this needs to be reviewed.
 *
 * @param obj Any type of a value can be checked.
 */
export function isToSignalInput(obj: unknown): obj is ToSignalInput<unknown> {
  return typeof (obj as Partial<ToSignalInput<unknown>>)?.subscribe === 'function';
}
