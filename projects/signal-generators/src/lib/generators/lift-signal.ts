
import { Signal, WritableSignal, signal } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';

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
 * const awesomeArray = liftSignal([1, 2, 3, 4], ['push', 'pop'], ['filter']);
 * awesomeArray.push(5);
 * console.log(awesomeArray()); //[1, 2, 3, 4, 5];
 * awesomeArray.pop();
 * console.log(awesomeArray()); //[1, 2, 3, 4];
 * awesomeArray.filter(x => x % 2 === 0);
 * console.log(awesomeArray()); //[2, 4];
 * ```
 * @param valueSource Either a value or a Writable signal.
 * @param mutators A tuple that contains the names that will modify the signal's value directly.
 * @param updaters A tuple that contains the names that will return T.
 * @typeParam T the type of the signal's value as well as the type where the functions are lifted from.
 * @typeParam M A tuple that contains the names of methods appropriate for mutating.
 * @typeParam U A tuple that contains the names of methods appropriate for updating.
 */
export function liftSignal<T extends NonNullable<unknown>,
    const M extends readonly MethodKey<T>[] | null | undefined,
    const U extends readonly UpdaterKey<T>[] | null | undefined = null>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>,
  mutators: M,
  updaters?: U):
  WritableSignal<T> & BoundMethods<T, M> & BoundMethods<T, U> {

  const output = isSignalInput(valueSource)
    ? coerceSignal(valueSource as WritableSignal<T>)
    : signal(valueSource);

  const boundMethods: Partial<BoundMethodsStrict<T, NonNullable<M>> & BoundMethodsStrict<T, NonNullable<U>>> = {};

  mutators?.forEach((cur) => {
    boundMethods[cur] = (...args) => output.update(x => {
      (x[cur] as MethodKeyFn<typeof x, typeof cur>)(...args);
      return x;
    });
  });

  updaters?.forEach((cur) => {
    boundMethods[cur] = (...args) => output.update(x => (x[cur] as UpdaterKeyFn<typeof x, typeof cur>)(...args));
  });

  return Object.assign(output, boundMethods as BoundMethods<T, M> & BoundMethods<T, U>);
}
