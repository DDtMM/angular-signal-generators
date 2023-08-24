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

// an interesting idea - the type passed is just an object's methods
// export function isMethodKey<T extends { [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never }>(obj: T, key: unknown): key is keyof T {
//   return (typeof obj[key as keyof T] === 'function');
// }

/** Detects if a key is a key of an object's method */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMethodKey<T extends object>(obj: T | null | undefined, key: unknown): key is keyof { [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never] : K } & keyof T {
  return obj != null && (typeof obj[key as keyof T] === 'function');
}
