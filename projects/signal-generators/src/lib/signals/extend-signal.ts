/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injector, Signal, ValueEqualityFn } from '@angular/core';
import { toSignalProxy } from '../internal/to-signal-proxy';
import { ValueSourceSignal, valueSourceToSignal } from '../internal/value-source-utilities';
import { SignalProxy } from '../signal-proxy';
import { ValueSource, ValueSourceValue } from '../value-source';

/*
 * Options for extendSignal
 * @deprecated see {@link extendSignal} for more info.
 */
export interface ExtendSignalOptions<T> {
  /** This is only used if a writable signal is created from a value */
  equal?: ValueEqualityFn<T>;
  /** This is only used if a signal is created from an observable. */
  injector?: Injector;
}

/*
 * A method whose first argument is a SignalProxy.
 * @deprecated This is only used with extendSignal, which is deprecated.
 */
export type ProxyMethod<S extends Signal<any>> = (p: SignalProxy<S>, ...args: any) => void;

/** @deprecated This is only used with extendSignal, which is deprecated. */
export type OutputMethod<P extends ProxyMethod<ValueSourceSignal<any>>> =
  P extends (p: any, ...args: infer A) => infer R ? (...args: A) => R : never;

/** @deprecated This is only used with extendSignal, which is deprecated. */
export type OutputMethods<M extends Record<string, ProxyMethod<ValueSourceSignal<any>>>> = {
  [K in keyof M]: OutputMethod<M[K]>
};

/**
 * extendSignal allows additional functions added to a Signal or value converted to a WritableSignal.
 * @deprecated This was mildly useful for Angular 16, but with signalSetFn and signalUpdateFn from primitives, it is no longer needed.
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
  options: ExtendSignalOptions<T> = {}):
  Signal<ValueSourceValue<V>> & Omit<ValueSourceSignal<V>, keyof M> & OutputMethods<M> {

  const output: ValueSourceSignal<V> = valueSourceToSignal(valueSource, options);
  // create proxy only there is overlap.  Overlap is found by checking if any keys are in our output signal.
  const proxy = Object.keys(methods).some(x => x in output)
    ? toSignalProxy(output)
    : output as SignalProxy<ValueSourceSignal<V>>;

  // for each key in methods, create a method that will be assigned to output.
  // The method will accept the proxy as the first argument and all the same arguments after
  const assignMethods = Object.keys(methods).reduce((acc, key: keyof typeof methods) => {
    const innerMethod = methods[key];
    acc[key] = ((...args) => innerMethod(proxy, ...args)) as OutputMethod<typeof innerMethod>;
    return acc;
  }, {} as OutputMethods<M>)


  return Object.assign(output, assignMethods) as (Signal<ValueSourceValue<V>> & ValueSourceSignal<V> & OutputMethods<M>);
}
