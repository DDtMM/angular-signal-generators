/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injector, Signal, WritableSignal, signal } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { toSignalProxy } from '../internal/to-signal-proxy';
import { SignalInput } from '../signal-input';
import { SignalProxy } from '../signal-proxy';
import { ValueSource } from '../value-source';

export interface ExtendSignalOptions {
    /** This is only used if a signal is created from an observable. */
    injector?: Injector;
}

export type ValueSourceSignal<V extends ValueSource<any>> =
  V extends Signal<any> ? V
    : V extends SignalInput<infer T> ? Signal<T>
      : WritableSignal<V>;

export type ProxyMethod<S extends Signal<any>> = (p: SignalProxy<S>, ...args: any) => void;

type OutputMethod<P extends ProxyMethod<ValueSourceSignal<any>>> = P extends (p: any, ...args: infer A) => infer R ? (...args: A) => R : never;

export type OutputMethods<M extends Record<string, ProxyMethod<ValueSourceSignal<any>>>> = {
  [K in keyof M]: OutputMethod<M[K]> }

/**
 * extendSignal allows additional functions added to a Signal or value converted to a WritableSignal.

 * @param valueSource Either a plain old value or a signal that will have functions added to it.
 * @param methods A literal of functions to be added.  Each function will have a first parameter that is a signal proxy,
 * which could be the original signal, or if there is a conflict with the method names, an object that is similar to the original.
 * This is so the definition of the signal can change on the outside, but the original implementation is still available.
 * @returns a signal with new functions added to it.
 * @example
 * ```ts
 * const original = signal('unchanged');
 * const extended = extendSignal(original, { clear: () => s.set(''); set: (s, excitedValue: string) => s.set(`${excitedValue}!!!`) });
 * extended.set('yay');
 * console.log(extended()); // yay!!!
 * extended.clear();
 * console.log(extended); // (empty string)
 * ```
 */
export function extendSignal<T, V extends ValueSource<T>, const M extends Record<string, ProxyMethod<ValueSourceSignal<V>>>> (
  valueSource: V,
  methods: M,
  options: ExtendSignalOptions = {}):
  Signal<T> & Omit<ValueSourceSignal<V>, keyof M> & OutputMethods<M> {

  const output = isSignalInput(valueSource)
    ? coerceSignal(valueSource, options) as ValueSourceSignal<V>
    : signal(valueSource) as ValueSourceSignal<V>;
  // create proxy only there is overlap.
  const proxy = Object.keys(methods).some(x => x in output) ? toSignalProxy(output) : output as SignalProxy<ValueSourceSignal<V>>;

  const assignMethods = Object.keys(methods).reduce((acc, key: keyof typeof methods) => {
    const innerMethod = methods[key];
    acc[key] = ((...args) => innerMethod(proxy, ...args)) as OutputMethod<typeof innerMethod>;
    return acc;
  }, {} as OutputMethods<M>)


  return Object.assign(output, assignMethods) as (Signal<T> & ValueSourceSignal<V> & OutputMethods<M>);
}

