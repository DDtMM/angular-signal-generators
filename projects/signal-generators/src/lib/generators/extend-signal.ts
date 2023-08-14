/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, WritableSignal, isSignal, signal } from '@angular/core';

export type WritableSignalProxy<T> = Pick<WritableSignal<T>, 'mutate' | 'set' | 'update'>;
export type ProxyMethod<T, A extends readonly any[]> = (signalProxy: WritableSignalProxy<T>, ...args: A) => any;
export type Methods<T, K extends string | number | symbol> = { [Key in K]: ProxyMethod<T, any[]> };
export type OutputMethods<M extends Methods<any, string | number | symbol>> =
  { [Key in keyof M]: M[Key] extends ProxyMethod<any, infer P> ? (...args: P) => ReturnType<M[Key]> : never };
export function extendSignal<T, const M extends Methods<T, string | number | symbol>>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>,
  methods: M
  ):
  WritableSignal<T> & OutputMethods<M> {

  const output: WritableSignal<T> = isSignal(valueSource) ? valueSource : signal(valueSource);
  // store references to original mutate, set, and update functions.
  const proxyInner: WritableSignalProxy<T> = {
    mutate: output.mutate,
    set: output.set,
    update: output.update
  }
  // create proxy which calls stored functions.
  const proxy: WritableSignalProxy<T> = {
    mutate: (mutatorFn: (value: T) => void) => proxyInner.mutate.call(output, mutatorFn),
    set: (value: T) => proxyInner.set.call(output, value),
    update: (updateFn: (value: T) => T) => proxyInner.update.call(output, updateFn)
  };
  const assignMethods: Partial<OutputMethods<M>> = {};
  for (const key in methods) {
    const innerMethod = methods[key];
    assignMethods[key] =
      ((...args: any) => innerMethod.apply(output, [proxy, ...args])) as any;
  }
  // Object.entries(methods).forEach(([key, innerMethod]) => assignMethods[key] =
  //   (...args: Exclude<Parameters<typeof innerMethod>, Parameters<typeof innerMethod>[0]>) => innerMethod.apply(output, [proxy, ...args]));

  return Object.assign(output, assignMethods as OutputMethods<M>);
}

const yyy = extendSignal(1, { doSomething: (proxy, a: number) => proxy.set(a + 5)});

yyy.doSomething(5);
