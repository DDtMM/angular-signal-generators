import { DestroyRef, Injector, assertInInjectionContext, inject } from '@angular/core';

/** Gets the DestroyRef either using the passed injector or inject function. */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getDestroyRef(fn: Function, injector?: Injector | null | undefined): DestroyRef {
  if (injector) {
    return injector.get(DestroyRef);
  }

  assertInInjectionContext(fn);
  return inject(DestroyRef);
}

/** A type safeway for determining a key is in an object. */
export function hasKey<T extends object>(obj: T | null | undefined, key: keyof T): obj is T & { [K in typeof key]-?: T[K] } {
  return obj != null && (key in obj);
}
