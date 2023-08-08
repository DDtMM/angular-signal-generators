/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { WritableSignal, isSignal, signal } from '@angular/core';

export type MethodKey<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never] : K } & keyof T;
export type MethodKeyStrict<T> = keyof { [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never] : K };
export type MethodKeys<T> = readonly MethodKey<T>[];
export type UpdaterKeys<T> = readonly (keyof { [K in keyof T as T[K] extends () => T ? K : never] : K })[];


type BoundMethods<T, K extends keyof T> =
  { [Key in K]: T[Key] extends (...args: any[]) => unknown ? (...args: Parameters<T[Key]>) => void : never };

export function objectSignal<T, M extends MethodKeys<T>>(
  valueSource: T | WritableSignal<T>,
  mutators: readonly [...M]):
  WritableSignal<T> & BoundMethods<T, typeof mutators[number]> {

  let value: T;
  let output: WritableSignal<T>;
  if (isSignal(valueSource)) {
    output = valueSource as WritableSignal<T>;
    value = output();
  }
  else {
    value = valueSource;
    output = signal(valueSource);
  }
  if (!mutators) {
    return output as any;
  }
  const mutatorFns = mutators.reduce((acc, cur) =>
    ({ ...acc, [cur]: (...args: any) => output.mutate(x => (x[cur] as any)(...args)) })
    , {} as BoundMethods<T, M[number]>)

  return Object.assign(output, { ...mutatorFns });
}
