/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal } from '@angular/core';
import { SignalProxy } from '../signal-proxy';


/**
 * Creates a signal-like object that has all of the functions copied from the signal,
 * and returns the source's value when called like a function
 */
export function toSignalProxy<S extends Signal<any>>(source: S): SignalProxy<S> {
  const methods = getMethods(source);
  return methods.reduce((acc, cur) => {
    acc[cur] = source[cur];
    return acc;
  }, (() => source()) as SignalProxy<S>);
}

function getMethods<S extends Signal<unknown>>(obj: S): readonly (keyof SignalProxy<S>)[] {
  const result: (keyof SignalProxy<S>)[] = [];
  for (const key in obj) {
    if (isMethodKey(obj, key)) {
      result.push(key);
    }
  }
  return result;
}

function isMethodKey<S extends Signal<unknown>>(obj: S, key: keyof S): key is keyof SignalProxy<S> {
  return (typeof obj[key] === 'function');
}
