import { Injector, Signal, computed, isSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { hasKey } from './utilities';

/** A type that can be converted to a signal with toSignal. */
type ToSignalInput<T> = Parameters<typeof toSignal<T>>[0]

/** Either a signal or a function that can be converted to a signal using computed. */
type SignalLike<T> = Signal<T> | (() => T);

/** Could be a function used in a computed, a type compatible with toSignal, or just a signal. */
export type SignalInput<T> = SignalLike<T> | ToSignalInput<T>;

export interface CoerceSignalOptions<T> {
  /** This is only used if toSignal is needed to convert to a signal.  If not passed it as assumed the source is sync. */
  initialValue?: T;
  /** This is only used if toSignal is needed to convert to a signal to get destroyedRef. */
  injector?: Injector;
}

/**
 * Converts a source to a signal.
 * * If it is already a signal then it is returned.
 * * If it matches the input type to toSignal function, then it is converted to a signal.
 *   If initial value is passed then it doesn't have to be an async observable.
 * * If it is just a function then it is converted to a signal with computed.
 *
 * @example
 * ```ts
 * const signalInput = signal(1);
 * const functionInput = () => signalInput() * 2;
 * const immediateInput = timer(0, 1000);
 * const delayedInput = timer(1000, 1000);
 *
 * const coercedSignal = coerceSignal(signalInput);
 * const coercedFunction = coerceSignal(functionInput);
 * const coercedImmediate = coerceSignal(immediateInput);
 * const coercedDelayed = coerceSignal(delayedInput, { initialValue: 0 });
 *
 * effect(() => {
 *   console.log(coercedSignal, coercedFunction, coercedImmediate, coercedDelayed);
 * });
 * ```
 */
export function coerceSignal<T>(source: SignalInput<T>, options?: CoerceSignalOptions<T>): Signal<T> {
  if (isSignal(source)) {
    return source;
  }
  else if (isToSignalInput(source)) {
    return (options && hasKey(options, 'initialValue'))
      ? toSignal(source, options)
      : toSignal(source, { injector: options?.injector, requireSync: true })
  }
  return computed(source);
}

/**
 * Tests if an object is valid for coerceSignal.
 *
 * @param obj Any type of a value can be checked.
 */
export function isSignalInput(obj: unknown): obj is SignalInput<unknown> {
  return (obj != null) && (typeof obj === 'function' || isToSignalInput(obj));
}

/**
 * Determines if an object is a parameter for toSignalInput by looking for subscribe property.
 * It does this by seeing if there is a subscribe function.
 * If toSignal's implementation changes, then this needs to be reviewed.
 *
 * @param obj Any type of a value can be checked.
 */
function isToSignalInput<T>(obj: unknown): obj is ToSignalInput<T> {
  return typeof (obj as Partial<ToSignalInput<T>>)?.subscribe === 'function';
}
