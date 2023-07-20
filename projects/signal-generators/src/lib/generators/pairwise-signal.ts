import { Injector, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { SignalInput, coerceSignal } from '../internal/signal-coercion';

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

type PairwiseSignalOptionsWithoutInitialValue<T> = Omit<PairwiseSignalOptions<T>, 'initialValue'>;

export function pairwiseSignal<T>(src: SignalInput<T>, options?: PairwiseSignalOptionsWithoutInitialValue<T>): Signal<[prior: T, current: T] | undefined>
export function pairwiseSignal<T>(src: SignalInput<T>, options: PairwiseSignalOptionsWithInitialValue<T>): Signal<[prior: T, current: T]>
export function pairwiseSignal<T>(src: SignalInput<T>, options?: PairwiseSignalOptions<T>): Signal<[prior: T, current: T] | undefined> {
  let output: WritableSignal<[T, T] | undefined>;
  const srcSignal = coerceSignal(src);
  let currentValue = srcSignal();

  if (options?.initialValue) {
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
