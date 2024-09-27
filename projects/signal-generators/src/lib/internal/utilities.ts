import { DestroyRef, Injector, Signal, assertInInjectionContext, inject } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunctionType = (...args: any[]) => void;

/**
 * This is inspired by `signalAsReadonlyFn` from https://github.com/angular/angular/blob/main/packages/core/src/render3/reactivity/signal.ts#L90
 * It does not cache the readonlyFn, just creates a new one each time.
 */
export function asReadonlyFnFactory<T>($src: Signal<T>): () => Signal<T> {
  const $readonly = (() => $src()) as Signal<T>;
  $readonly[SIGNAL] = $src[SIGNAL];
  return () => $readonly;
}

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

/**
 * A type safe way for determining a key is in an object.
 * This is still needed because when "in" is used the propertyType can be inferred as undefined.
 */
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

