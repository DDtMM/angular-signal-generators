/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, WritableSignal, signal } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { toSignalProxy } from '../internal/to-signal-proxy';
import { SignalInput } from '../signal-input';
import { ValueSource } from '../value-source';
import { SignalProxy } from '../signal-proxy';


type ValueSourceSignal<V extends ValueSource<any>> =
  V extends Signal<any> ? V
    : V extends SignalInput<infer T> ? Signal<T>
      : WritableSignal<V>;

export type ProxyMethod<S extends Signal<any>> = (p: SignalProxy<S>, ...args: any) => void;

type OutputMethod<P extends ProxyMethod<ValueSourceSignal<any>>> = P extends (p: any, ...args: infer A) => infer R ? (...args: A) => R : never;

export type OutputMethods<M extends Record<string, ProxyMethod<ValueSourceSignal<any>>>> = {
  [K in keyof M]: OutputMethod<M[K]> }

/**
 * extendSignal allows additional functions added to a Signal or value converted to a WritableSignal.
 * @param valueSource Either a plain old value, or a WritableSignal that will have functions added to it.
 * @param methods A literal of functions to be added.  Each function will have a first parameter that is a signal proxy,
 * which contains the functions on a writable signal, plus a getter.
 * This is so the definition of the signal can change on the outside, but the original implementation is still available.
 * @returns a signal with new functions added to it.
 */
export function extendSignal<T, V extends ValueSource<T>, const M extends Record<string, ProxyMethod<ValueSourceSignal<V>>>> (
  valueSource: V,
  methods: M):
  Signal<T> & Omit<ValueSourceSignal<V>, keyof M> & OutputMethods<M> {

  const output = isSignalInput(valueSource) ? coerceSignal(valueSource) as ValueSourceSignal<V> : signal(valueSource) as ValueSourceSignal<V>;
  const proxy = Object.keys(methods).some(x => x in output) ? toSignalProxy(output) : output as SignalProxy<ValueSourceSignal<V>>;
  const assignMethods: Partial<OutputMethods<M>> = {};

  for (const key in methods) {
    const innerMethod = methods[key];
    assignMethods[key] = ((...args) => innerMethod(proxy, ...args)) as OutputMethod<typeof innerMethod>;
  }

  return Object.assign(output, assignMethods) as Signal<T> & Omit<ValueSourceSignal<V>, keyof M> & OutputMethods<M>;
}
