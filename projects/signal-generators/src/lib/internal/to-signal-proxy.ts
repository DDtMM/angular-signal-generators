/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, computed, untracked } from '@angular/core';
import { SignalFunction, SignalFunctions, SignalProxy } from '../signal-proxy';


/**
 * Creates a computed signal that wraps the internal signal and then adds the original function.
 * This signal will NOT be reactive, and is only intended for situations where it needs to match a signal's signature.
 * The only guarantee is that the functions are copied.  If a property is added to a signal it is ignored.
 */
export function toSignalProxy<S extends Signal<any>>(source: S): SignalProxy<S> {
  const methods = getMethodKeys(source).reduce((acc, cur) => {
    // typings here need to be fixed.
    acc[cur] = (source[cur] as SignalFunction<S, typeof cur>).bind(source) as SignalFunction<S, typeof cur>;
    return acc;
  }, {} as SignalFunctions<S>);
  return Object.assign(computed(() => untracked(source)), methods);

  function getMethodKeys<S extends Signal<unknown>>(obj: S): readonly (keyof SignalFunctions<S>)[] {
    const result: (keyof SignalFunctions<S>)[] = [];

    for (const key in obj) {
      if (isMethodKey(key)) {
        result.push(key);
      }
    }
    return result;

    function isMethodKey(key: keyof S): key is keyof SignalFunctions<S> {
      return (typeof obj[key] === 'function');
    }
  }

}
