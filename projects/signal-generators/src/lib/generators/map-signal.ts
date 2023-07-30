import { Signal, ValueEqualityFn, computed, signal } from '@angular/core';

export interface MapSignalOptions<TOut>  {
  /**
   * An equal function put on the selector result.
   * This won't behave quite the same if the signal is tracked.
   * This is because the equality function will only work on emitted values for tracked values based om how computed works.
   * For untracked, it's always run after each change.
   */
  equal?: ValueEqualityFn<TOut>;
  /**
   * If true, then the selector should be put inside a computed signal so that any changes to
   * signal inside of it will update the MapSignal's value.
   * Otherwise it will only run when the signal is changed by a method.
   */
  trackSelector?: boolean;
}

/** A signal that is updated with TIn, but emits TOut due to a selector specified at creation. */
export interface MapSignal<TIn, TOut> extends Signal<TOut> {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<TOut>;
  /** Contains the values that are input to the signal. */
  input: Signal<TIn>;
  mutate(mutatorFn: (value: TIn) => void): void;
  set(value: TIn): void;
  update(updateFn: (value: TIn) => TIn): void;
}

/**
 * Creates a signal whose input value is immediately mapped to a different value based on a selector.
 * The selector can contain signals, and when **trackSelector** is *true* in **options**, will react to changes in those signals.
 * @param initialValue The initial value that will be run
 * @param selector A selector that is run after the value of the signal is changed.
 * @param options Can see equality function or if the selector should be tracked inside a computed signal.
 * @returns A MapSignal
 * @example
 * ```ts
 * const addOne = mapSignal(1, x => x + 1);
 * console.log(addOne()); // 2
 *
 * const addOnePlusOne = mapSignal(1, x => x + addOne());
 * console.log(addOnePlusOne()); // 3
 *
 * addOne.set(2);
 * console.log(addOnePlusOne()); // 3 - no change because the selector is not reactive.
 * addOnePlusOne.set(2)
 * console.log(addOnePlusOne()); // 5 = 2 + (2 + 1)
 *
 * const addOnePlusOneTracked = mapSignal(1, x => x + addOne(), { trackSelector: true });
 * console.log(addOnePlusOneTracked); // 4
 * addOne.set(3);
 * console.log(addOnePlusOneTracked); // 5
 * ```
 */
export function mapSignal<TIn, TOut>(initialValue: TIn, selector: (x:TIn) => TOut, options: MapSignalOptions<TOut> = {}): MapSignal<TIn, TOut> {
  const input = signal<TIn>(initialValue);
  if (options.trackSelector) {
    const output = computed(() => selector(input()), { equal: options.equal });
    return Object.assign(output, {
      asReadonly: () => output,
      input,
      mutate: input.mutate.bind(input),
      set: input.set.bind(input),
      update: input.update.bind(input)
    });
  }

  const output = signal<TOut>(selector(initialValue));
  const setFn = setterFactory()
  return Object.assign(output, {
    asReadonly: () => output,
    input,
    mutate: (mutatorFn: (value: TIn) => void) => {
      input.mutate(mutatorFn);
      setFn(selector(input()));
    },
    set: (value: TIn) => {
      input.set(value);
      setFn(selector(input()));
    },
    update: (updateFn: (value: TIn) => TIn) => {
      input.update(updateFn);
      setFn(selector(input()));
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
        if (!equalFn(output(), value)) {
          originalSetFn.call(output, value);
        }
      };
  }
}


