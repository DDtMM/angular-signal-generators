/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, WritableSignal, isSignal, signal } from '@angular/core';

export interface WritableSignalProxy<T> extends Pick<WritableSignal<T>, 'mutate' | 'set' | 'update'> {
  /** Returns the result if you just called the signal function. */
  get: () => T;
};

export type ProxyMethod<T> = (p: WritableSignalProxy<T>, ...args: any) => any;

type OutputMethod<P extends ProxyMethod<any>> = P extends (p: WritableSignalProxy<any>, ...args: infer A) => infer R ? (...args: A) => R : never;

export type OutputMethods<M extends Record<string, ProxyMethod<any>>> = { [K in keyof M]: OutputMethod<M[K]> }

/**
 * extendSignal allows additional functions added to a WritableSignal or value converted to a WritableSignal.
 * @param valueSource Either a plain old value, or a WritableSignal that will have functions added to it.
 * @param methods A literal of functions to be added.  Each function will have a first parameter that is a signal proxy,
 * which contains the functions on a writable signal, plus a getter.
 * This is so the definition of the signal can change on the outside, but the original implementation is still available.
 * @returns a signal with new functions added to it.
 */
export function extendSignal<T,const M extends Record<string, ProxyMethod<T>>>(
  valueSource: Exclude<T, Signal<unknown>> | WritableSignal<T>, methods: M):
  WritableSignal<T> & OutputMethods<M> {

  const output: WritableSignal<T> = isSignal(valueSource) ? valueSource : signal(valueSource);
  // store references to original mutate, set, and update functions.
  const mutateProxyFn  = output.mutate;
  const setProxyFn = output.set;
  const updateProxyFn = output.update;

  // create proxy which calls stored functions.
  const proxy: WritableSignalProxy<T> = {
    get: () => output(),
    mutate: (mutatorFn: (value: T) => void) => mutateProxyFn.call(output, mutatorFn),
    set: (value: T) => setProxyFn.call(output, value),
    update: (updateFn: (value: T) => T) => updateProxyFn.call(output, updateFn)
  };
  const assignMethods: Partial<OutputMethods<M>> = {};

  for (const key in methods) {
    const innerMethod = methods[key];
    assignMethods[key] = ((...args) => innerMethod(proxy, ...args)) as OutputMethod<typeof innerMethod>;
  }

  return Object.assign(output, assignMethods as OutputMethods<M>);
}
