import { Injector, Signal, computed, isSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SignalInput, isToSignalInput } from '../signal-input';
import { hasKey } from './utilities';

export interface CoerceSignalOptions<T> {
  /** This is only used if toSignal is needed to convert to a signal.  If not passed it as assumed the source is sync. */
  initialValue?: T;
  /** This is only used if toSignal is needed to convert to a signal OR to get destroyedRef. */
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


