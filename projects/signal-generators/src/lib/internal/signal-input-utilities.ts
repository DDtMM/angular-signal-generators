import { isSignal } from '@angular/core';
import { SignalInput, ToSignalInput } from '../signal-input';

export function isSignalInput<T>(obj: SignalInput<T> | T): obj is SignalInput<T>
export function isSignalInput(obj: unknown): obj is SignalInput<unknown>
/**
 * Tests if an object is valid for coerceSignal.
 *
 * @param obj Any type of a value can be checked.
 */
export function isSignalInput(obj: unknown): obj is SignalInput<unknown> {
  return (obj != null) && (isSignal(obj) || isSignalInputFunction(obj) || isToSignalInput(obj));
}

export function isSignalInputFunction<T>(obj: SignalInput<T>): obj is () => T
export function isSignalInputFunction(obj: unknown): obj is () => unknown
/** Is true if obj is a function and it has no arguments. */
export function isSignalInputFunction(obj: unknown): obj is () => unknown {
  return typeof obj === 'function' && obj.length === 0 && !isSignal(obj);
}

export function isToSignalInput<T>(obj: SignalInput<T>): obj is ToSignalInput<T>
export function isToSignalInput(obj: unknown): obj is ToSignalInput<unknown>
/**
 * Determines if an object is a parameter for toSignalInput by looking for subscribe property.
 * It does this by seeing if there is a subscribe function.
 * If toSignal's implementation changes, then this needs to be reviewed.
 *
 * @param obj Any type of a value can be checked.
 */
export function isToSignalInput(obj: unknown): obj is ToSignalInput<unknown> {
  return typeof (obj as Partial<ToSignalInput<unknown>>)?.subscribe === 'function';
}
