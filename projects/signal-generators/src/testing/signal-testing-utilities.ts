import { CreateComputedOptions, Signal, WritableSignal, computed, isSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
            TestBed.flushEffects();
            //fixture.detectChanges();
            return res;
          }
        });
      }
      return propVal;
    }
  });

  return proxy;
}

type ComputedSpy<T> = Signal<T> & { timesUpdated: number };

/** Creates a computed signal that monitors the number of times it is updated. */
export function computedSpy<T>(computation: () => T, options?: CreateComputedOptions<T>): ComputedSpy<T> {
  let timesUpdated = 0;
  const output = computed(() => {
    timesUpdated++;
    return computation();
  }, options);
  Object.defineProperty(output, 'timesUpdated', { get: () => timesUpdated });
  return output as ComputedSpy<T>;
}
