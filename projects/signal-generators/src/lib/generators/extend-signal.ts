/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, WritableSignal, isSignal, signal } from '@angular/core';

export type WritableSignalProxy<T> = Pick<WritableSignal<T>, 'mutate' | 'set' | 'update'>;

export type ProxyMethod<T, F extends (signalProxy: WritableSignalProxy<T>, ...args: readonly any[]) => unknown> =
  F extends (signalProxy: WritableSignalProxy<T>, ...args: infer P) => infer R
    ? (signalProxy: WritableSignalProxy<T>, ...args: P) => R
    : never;

export type ProxyMethodParams<F extends ProxyMethod<unknown, () => any>> =
  F extends (signalProxy: WritableSignalProxy<any>, ...args: infer P) => any ? P : never;

export type Methods<T, K extends string | number | symbol> = { [Key in K]: ProxyMethod<T, () => void> };

export type OutputMethod<F extends ProxyMethod<any, () => any>> =
  F extends ProxyMethod<infer T, infer F2>
    ? F2 extends ((signalProxy: WritableSignalProxy<T>, ...args: infer P) => infer R)
      ? (...args: P) => R : never
    : never;
export type OutputMethodParams<F extends ProxyMethod<any, () => any>> =
    F extends (signalProxy: WritableSignalProxy<any>, ...args: infer P) => any ? P : never;

export type OutputMethods<M extends Methods<any, string | number | symbol>> = { [Key in keyof M]: OutputMethod<M[Key]> };

export function extendSignal<T, const M extends Methods<T, string | number | symbol>>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>,
  methods: M
  ):
  WritableSignal<T> & OutputMethods<M> {

  const output: WritableSignal<T> = isSignal(valueSource) ? valueSource : signal(valueSource);
  // store references to original mutate, set, and update functions.
  const mutateProxyFn  = output.mutate;
  const setProxyFn = output.set;
  const updateProxyFn = output.update;

  // create proxy which calls stored functions.
  const proxy: WritableSignalProxy<T> = {
    mutate: (mutatorFn: (value: T) => void) => mutateProxyFn.call(output, mutatorFn),
    set: (value: T) => setProxyFn.call(output, value),
    update: (updateFn: (value: T) => T) => updateProxyFn.call(output, updateFn)
  };
  const assignMethods: Partial<OutputMethods<M>> = {};
  for (const key in methods) {
    const innerMethod: ProxyMethod<T, any> = methods[key];
    assignMethods[key] =
      ((...args: OutputMethodParams<typeof innerMethod>) => innerMethod.apply(output, [proxy, ...args])) as any;
  }
  // Object.entries(methods).forEach(([key, innerMethod]) => assignMethods[key] =
  //   (...args: Exclude<Parameters<typeof innerMethod>, Parameters<typeof innerMethod>[0]>) => innerMethod.apply(output, [proxy, ...args]));

  return Object.assign(output, assignMethods as OutputMethods<M>);
}

const yyy = extendSignal(1, { doSomething: (proxy, a: number) => proxy.set(a + 5)});

yyy.doSomething(5);
