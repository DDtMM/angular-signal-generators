import { computed } from '@angular/core';
import { SignalInputValue, SignalInput } from '../signal-input';
import { coerceSignal } from '../internal/signal-coercion';

export function mapSignal2<TIn extends readonly SignalInput<unknown>[], TOut>(
  inputs: readonly [...TIn], selector: (values: SignalInputValue<(typeof inputs)[number]>) => TOut) {

  const inputSignals: [SignalInputValue<(typeof inputs)[number]>] = inputs.map(x => coerceSignal(x));
  return computed(() => {
    return selector(inputSignals.map(x => x()));
  })
}
