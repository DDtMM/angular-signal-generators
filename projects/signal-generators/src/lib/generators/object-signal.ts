/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Signal, WritableSignal, isSignal, signal } from '@angular/core';

type MethodKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => any ? K : never] : K } & keyof T;
type MethodKeys<T> = readonly MethodKey<T>[];
type UpdaterKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => T ? K : never] : K } & keyof T;
type UpdaterKeys<T> = readonly UpdaterKey<T>[];
type MethodParameters<T, K extends MethodKey<T> | UpdaterKey<T>> = T[K] extends ( ...args: infer P ) => any ? P : never;
type MethodKeyMethod<T, K extends MethodKey<T>> = T[K] extends ( ...args: infer P ) => infer R ? (...args: P) => R : never;
type UpdaterKeyMethod<T, K extends UpdaterKey<T>> = T[K] extends ( ...args: infer P ) => T ? (...args: P) => T : never;
type BoundMethodsStrict<T, K extends MethodKeys<T> | UpdaterKeys<T>> = { [Key in K[number]]: (...args: MethodParameters<T, Key>) => void };
type BoundMethods<T, K extends MethodKeys<T> | UpdaterKeys<T> | null | undefined> =
  K extends MethodKeys<T> | UpdaterKeys<T> ? BoundMethodsStrict<T, K> : {};

export function objectSignal<T, M extends MethodKeys<T>, U extends UpdaterKeys<T>>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>,
  mutators: M | null | undefined,
  updaters?: U | null | undefined):
  WritableSignal<T> & BoundMethods<T, M> & BoundMethods<T, U> {

  const output: WritableSignal<T> = isSignal(valueSource) ? valueSource : signal(valueSource);

  const boundMethods: Partial<BoundMethodsStrict<T, M> & BoundMethodsStrict<T, U>> = {};
  mutators?.forEach((cur) => {
    boundMethods[cur] = (...args) => output.mutate(x => (x[cur] as MethodKeyMethod<typeof x, typeof cur>)(...args));
  });

  updaters?.forEach((cur) => {
    boundMethods[cur] = (...args) => output.update(x => (x[cur] as UpdaterKeyMethod<typeof x, typeof cur>)(...args));
  });

  return Object.assign(output, boundMethods as BoundMethods<T, M> & BoundMethods<T, U>);
}

