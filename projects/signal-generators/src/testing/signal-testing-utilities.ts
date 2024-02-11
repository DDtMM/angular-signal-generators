import { Signal, WritableSignal, isSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

/** Wraps a signal with a Proxy that calls change detection after each method call. */
export function autoDetectChangesSignal<T, S extends Signal<T>>(fixture: ComponentFixture<unknown>, source: S): S;
/** Creates a writable signal that wraps a signal with a Proxy that calls change detection after each method call. */
export function autoDetectChangesSignal<T>(fixture: ComponentFixture<unknown>, source: T): WritableSignal<T>;
export function autoDetectChangesSignal<T, S extends Signal<T>>(
  fixture: ComponentFixture<unknown>,
  source: S | T
): S | WritableSignal<T> {
  const output = isSignal(source) ? source : signal(source);
  const proxy = new Proxy(output, {
    get(target, propName: keyof typeof output, receiver) {
      const propVal = Reflect.get(target, propName, receiver);
      if (typeof propVal === 'function') {
        return new Proxy(propVal, {
          apply: (targetInner, thisArg, argumentsList) => {
            const res = Reflect.apply(targetInner, thisArg, argumentsList);
            fixture.detectChanges();
            return res;
          }
        });
      }
      return propVal;
    }
  });

  return proxy;
}

