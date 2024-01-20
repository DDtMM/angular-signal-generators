import { DestroyRef, Injector, assertInInjectionContext, inject } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunctionType = (...args: any[]) => void;

/** Gets the DestroyRef either using the passed injector or inject function. */
export function getDestroyRef(fnType: AnyFunctionType, injector?: Injector | null | undefined): DestroyRef {
  if (injector) {
    return injector.get(DestroyRef);
  }

  assertInInjectionContext(fnType);
  return inject(DestroyRef);
}

/** Gets the injector, throwing if the function is in injection context.  */
export function getInjector(fnType: AnyFunctionType): Injector {
  assertInInjectionContext(fnType);
  return inject(Injector);
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
export function isMethodKey<T extends object>(obj: T | null | undefined, key: unknown): key is keyof { [K in keyof T as T[K] extends (...args: any[]) => any ? K : never] : K } & keyof T {
  return obj != null && (typeof obj[key as keyof T] === 'function');
}
