import { Signal } from '@angular/core';
import { createSignal, SIGNAL, SignalGetter, signalSetFn, signalUpdateFn } from '@angular/core/primitives/signals';
import { asReadonlyFnFactory } from './utilities';

export interface RefValue<T> {
  readonly ref: T;
}
export type ReadonlyRefSignal<T> = Signal<RefValue<T>>;

export interface RefSignal<T> extends ReadonlyRefSignal<T>  {
  asReadonly: () => ReadonlyRefSignal<T>;
  set: (value: T) => void;
  update: (updateFn: (value: T) => T) => void;
}

/** Wraps values in RefValue so even if the same value is emitted it will be not equal. */
export function refSignal<T>(initialValue: T): RefSignal<T> {
  const $output = createSignal({ ref: initialValue }) as SignalGetter<RefValue<T>> & RefSignal<T>;
  const outputNode = $output[SIGNAL];
  $output.asReadonly = asReadonlyFnFactory($output);
  $output.set = (value: T) => signalSetFn(outputNode, { ref: value });
  $output.update = (updateFn: (value: T) => T) => signalUpdateFn(outputNode, x => ({ ref: updateFn(x.ref) }));
  return $output;
}
