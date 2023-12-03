
import { Signal, WritableSignal, signal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MethodKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never] : K } & keyof T;
export type UpdaterKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => T ? K : never] : K } & keyof T;
/* eslint-enable @typescript-eslint/no-explicit-any */
type MethodParameters<T, K extends MethodKey<T> | UpdaterKey<T>> = T[K] extends ( ...args: infer P ) => unknown ? P : never;
type MethodKeyFn<T, K extends MethodKey<T>> = T[K] extends ( ...args: infer P ) => infer R ? (...args: P) => R : never;
type UpdaterKeyFn<T, K extends UpdaterKey<T>> = T[K] extends ( ...args: infer P ) => T ? (...args: P) => T : never;
type BoundMethodsStrict<T, K extends readonly (MethodKey<T> | UpdaterKey<T>)[]> = { [Key in K[number]]: (...args: MethodParameters<T, Key>) => void };
export type BoundMethods<T, K extends readonly (MethodKey<T> | UpdaterKey<T>)[] | null | undefined> =
  (K extends NonNullable<K> ? BoundMethodsStrict<T, NonNullable<K>> : Record<string, never>);

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
export function liftSignal<T extends NonNullable<unknown>,
    const U extends readonly UpdaterKey<T>[] | null | undefined,
    const M extends readonly MethodKey<T>[] | null | undefined = null>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>,
  updaters: U,
  mutators?: M
  ):
  WritableSignal<T> & BoundMethods<T, M> & BoundMethods<T, U> {

  const output = SIGNAL in valueSource
    ? valueSource
    : signal(valueSource);

  const boundMethods: Partial<BoundMethodsStrict<T, NonNullable<M>> & BoundMethodsStrict<T, NonNullable<U>>> = {};

  updaters?.forEach((cur) => {
    boundMethods[cur] = (...args) => output.update(x => (x[cur] as UpdaterKeyFn<typeof x, typeof cur>)(...args));
  });

  if (mutators) {
    const cloneFn = Array.isArray(output())
      ? (x: T) => structuredClone(x)
      : (x: T) => Object.assign(Object.create(Object.getPrototypeOf(x)), x);
    mutators?.forEach((cur) => {
      boundMethods[cur] = (...args) => output.update(x => {
        const cloned = cloneFn(x);
        (cloned[cur] as MethodKeyFn<typeof x, typeof cur>)(...args);
        return cloned;
      });
    });
  }

  return Object.assign(output, boundMethods as BoundMethods<T, M> & BoundMethods<T, U>);
}
