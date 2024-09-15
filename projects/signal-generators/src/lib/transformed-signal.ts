import { Signal } from '@angular/core';

/**
 * This is like a writable signal, but the inputs and outputs are different types.
 * @typeParam TIn The input type used in set and update.
 * @typeParam TOut The output type used in asReadonly or when this is called as a signal.
 */
export interface TransformedSignal<TIn, TOut> extends Signal<TOut> {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<TOut>;
  /** Sets the input value of the signal. */
  set(value: TIn): void;
  /** Updates the input value of the signal. */
  update(updateFn: (value: TIn) => TIn): void;
}
