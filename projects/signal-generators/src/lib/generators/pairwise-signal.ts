import { Injector, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { SignalInput, coerceSignal } from '../internal/signal-coercion';
import { hasKey } from '../internal/utilities';

export interface PairwiseSignalOptions<T> {
  /** The value to put in the first results prior value.  Prevents undefined result from being returned initially */
  initialValue?: T;
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

interface PairwiseSignalOptionsWithInitialValue<T> extends PairwiseSignalOptions<T> {
  /** The value to put in the first results prior value.  Prevents undefined result from being returned initially */
  initialValue: T;
}

/** This isn't going to work, unless we're okay with possibly missing values.  Computed might be better than effect. */
export function pairwiseSignal<T>(src: SignalInput<T>, options: PairwiseSignalOptionsWithInitialValue<T>): Signal<[prior: T, current: T]>
export function pairwiseSignal<T>(src: SignalInput<T>, options?: PairwiseSignalOptions<T>): Signal<[prior: T, current: T] | undefined>
export function pairwiseSignal<T>(src: SignalInput<T>, options?: PairwiseSignalOptions<T>): Signal<[prior: T, current: T] | undefined> {
  let output: WritableSignal<[T, T] | undefined>;
  const srcSignal = coerceSignal(src);
  let currentValue = srcSignal();

  if (hasKey(options, 'initialValue')) {
    output = signal([options.initialValue, currentValue]);
  }
  else {
    output = signal(undefined);
  }

  // Need to use effect to track value, because if computed is used, it will miss values until signal is "watched."
  // Should be okay because there's no way to make a loop.
  effect(() => {
    const priorValue = currentValue;
    currentValue = srcSignal();
    output.set([priorValue, currentValue]);
  }, { allowSignalWrites: true, injector: options?.injector });
  return output;
}
