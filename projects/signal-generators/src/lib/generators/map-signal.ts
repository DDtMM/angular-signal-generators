import { Signal, ValueEqualityFn, computed, signal } from '@angular/core';

interface MapSignalOptions<TOut>  {
  /**
   * If true, then the selector should be put inside a computed signal.
   * Otherwise it will only run when the signal is changed by a method.
   */
  computed?: boolean;
  equal?: ValueEqualityFn<TOut>;
}

interface MapSignal<TIn, TOut> extends Signal<TOut> {
  asReadonly(): Signal<TOut>;
  mutate(mutatorFn: (value: TIn) => void): void;
  set(value: TIn): void;
  update(updateFn: (value: TIn) => TIn): void;
}

export function mapSignal<TIn, TOut>(initialValue: TIn, selector: (x:TIn) => TOut, options: MapSignalOptions<TOut> = {}): MapSignal<TIn, TOut> {
  if (options.computed) {
    const valueSource = signal<TIn>(initialValue);
    const output = computed(() => selector(valueSource()), { equal: options.equal });
    return Object.assign(output, {
      asReadonly: () => output,
      mutate: valueSource.mutate.bind(valueSource),
      set: valueSource.set.bind(valueSource),
      update: valueSource.update.bind(valueSource)
    });
  }

  let lastInput = initialValue;
  const output = signal<TOut>(selector(initialValue));
  const setFn = setterFactory()
  return Object.assign(output, {
    asReadonly: () => output,
    mutate: (mutatorFn: (value: TIn) => void) => {
      mutatorFn(lastInput);
      setFn(selector(lastInput));
    },
    set: (value: TIn) => {
      lastInput = value;
      setFn(selector(lastInput));
    },
    update: (updateFn: (value: TIn) => TIn) => {
      lastInput = updateFn(lastInput);
      setFn(selector(lastInput));
    }
  });
  /** creates a setter function that is different depending on options. */
  function setterFactory(): (value: TOut) => void {
    const originalSetFn = output.set;
    const equalFn = options.equal;
    if (!equalFn) {
      return (value: TOut) => originalSetFn.call(output, value);
    }
    return (value: TOut) => {
        if (!equalFn(value, output())) {
          originalSetFn.call(output, value);
        }
      };
  }
}


