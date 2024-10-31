import { Signal, ValueEqualityFn, WritableSignal, isSignal, signal } from '@angular/core';

/** Options for {@link liftSignal}. */
export interface LiftSignalOptions<T> {
  /**
   * Because signals only place nice with mutable objects, all mutations work by first cloning.
   * There is a default clone function present, but if there are problems with it, you can provide your own.
   */
  cloneFn?: (source: T) => T;
  /**
   * A debug name for the signal. Used in Angular DevTools to identify the signal.
   * Only used if a {@link WritableSignal} is NOT passed as the first argument.
   */
  debugName?: string;
  /**
   * Custom equality function.
   * Only used if a value and not a {@link WritableSignal} is passed as the first argument.
   */
  equal?: ValueEqualityFn<T>;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export type MethodKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never]: K } & keyof T;
export type UpdaterKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => T ? K : never]: K } & keyof T;
/* eslint-enable @typescript-eslint/no-explicit-any */
export type MethodParameters<T, K extends MethodKey<T> | UpdaterKey<T>> = T[K] extends (...args: infer P) => unknown ? P : never;
type MethodKeyFn<T, K extends MethodKey<T>> = T[K] extends (...args: infer P) => infer R ? (...args: P) => R : never;
type UpdaterKeyFn<T, K extends UpdaterKey<T>> = T[K] extends (...args: infer P) => T ? (...args: P) => T : never;
export type BoundMethods<T, K extends readonly (MethodKey<T> | UpdaterKey<T>)[]> = {
  [Key in K[number]]: (...args: MethodParameters<T, Key>) => void;
};


/**
 * Lifts methods from the signal's value to the signal itself.
 * @example
 * ```ts
 * const awesomeArray = liftSignal([1, 2, 3, 4], ['filter'], ['push', 'pop']);
 * awesomeArray.push(5);
 * console.log(awesomeArray()); //[1, 2, 3, 4, 5];
 * awesomeArray.pop();
 * console.log(awesomeArray()); //[1, 2, 3, 4];
 * awesomeArray.filter(x => x % 2 === 0);
 * console.log(awesomeArray()); //[2, 4];
 * ```
 * @param valueSource Either a value or a Writable signal.
 * @param updaters A tuple that contains the names that will return a new value.
 * @param mutators A tuple that contains the names that will modify the signal's value directly.
 * To guarantee this will return a new value, structuredClone or object.assign is used to create a brand new object, so used with caution.
 * @typeParam T the type of the signal's value as well as the type where the functions are lifted from.
 * @typeParam U A tuple that contains the names of methods appropriate for updating.
 * @typeParam M A tuple that contains the names of methods appropriate for mutating.
 */
export function liftSignal<
  T extends NonNullable<unknown>,
  const U extends readonly UpdaterKey<T>[] | null | undefined,
  const M extends readonly MethodKey<T>[] | null | undefined = null
>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>,
  updaters: U,
  mutators?: M,
  options?: LiftSignalOptions<T>
): WritableSignal<T> & BoundMethods<T, NonNullable<M>> & BoundMethods<T, NonNullable<U>> {
  const $output = isSignal(valueSource) ? valueSource : signal(valueSource, options);

  const boundMethods = {} as BoundMethods<T, NonNullable<M>> & BoundMethods<T, NonNullable<U>>;

  updaters?.forEach((cur) => {
    boundMethods[cur] = (...args) => $output.update((x) => (x[cur] as UpdaterKeyFn<typeof x, typeof cur>)(...args));
  });

  if (mutators) {
    const cloneFn = options?.cloneFn ?? cloneFnFactory($output());
    mutators.forEach((cur) => {
      boundMethods[cur] = (...args) =>
        $output.update((x) => {
          const cloned = cloneFn(x);
          (cloned[cur] as MethodKeyFn<typeof x, typeof cur>)(...args);
          return cloned;
        });
    });
  }

  return Object.assign($output, boundMethods);
}

/** Creates a cloning function based on the sample object. */
function cloneFnFactory<T>(sample: T): (source: T) => T {
  return Array.isArray(sample)
    ? (x: T) => structuredClone(x)
    : (x: T) => Object.assign(Object.create(Object.getPrototypeOf(x)), x);
}
