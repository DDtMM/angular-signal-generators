import { Signal, computed } from '@angular/core';
import { ComputationOrSignal, toSignal } from '../internal/signal-like';

export interface PairwiseSignalOptions<T> {
  initialValue: T;
}

export function pairwiseSignal<T>(src: ComputationOrSignal<T>): Signal<[prior: T, current: T] | undefined>
export function pairwiseSignal<T>(src: ComputationOrSignal<T>, options: PairwiseSignalOptions<T>): Signal<[prior: T, current: T]>
export function pairwiseSignal<T>(src: ComputationOrSignal<T>, options?: PairwiseSignalOptions<T>): Signal<[prior: T | undefined, current: T] | undefined> {
  let hasPriorValue = false;
  let priorValue: T;
  if (options !== undefined) {
    hasPriorValue = true;
    priorValue = options.initialValue;
  }
  const srcSignal = toSignal(src);
  const output = computed<[T, T] | undefined>(() => {
    const currentValue = srcSignal();
    let result: [T, T] | undefined;
    if (hasPriorValue) {
      result = [priorValue, currentValue];
    }
    else {
      result = undefined;
      hasPriorValue = true;
    }
    priorValue = currentValue;
    return result;
  }, { equal: () => !hasPriorValue });
  return output;
}
