/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { WritableSignal, isSignal, signal } from '@angular/core';


export type MethodKeys<T> = keyof { [K in keyof T]: T[K] extends () => unknown ? K : never };
export type UpdaterKeys<T> = keyof { [K in keyof T]: T[K] extends () => T ? K : never };

type BoundMethods<T, K extends MethodKeys<T>> = { [Key in K]: T[Key] extends () => unknown ? (x: Parameters<T[Key]>) => void : never }

export function objectSignal<T, M extends MethodKeys<T>, U extends UpdaterKeys<T>>(
  valueSource: T | WritableSignal<T>,
  mutators: readonly M[] | null | undefined,
  updaters: readonly U[] = []):
  WritableSignal<T> & BoundMethods<T, M | U> {

  let value: T;
  let output: WritableSignal<T>;
  if (isSignal(valueSource)) {
    value = valueSource();
    output = valueSource;
  }
  else {
    value = valueSource;
    output = signal(valueSource);
  }
  // const mutatorBinds: BoundMethods<T, M> = [];
  // const updaterBinds: BoundMethods<T, U> = [];
  // const mutatorBinds: BoundMethods<T, M> =
  //   (mutators ?? []).reduce((acc, cur) => {
  //     return {
  //       ...acc,
  //       [cur]: (...params: Parameters<T[typeof cur]>) => output.mutate(x => x[cur])
  //     };
  //   }, {} as BoundMethods<T, M> )

  // return Object.assign(output, { ...mutatorBinds, ...updaterBinds });
  return output as any;
}

