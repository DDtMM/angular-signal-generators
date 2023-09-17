import { Signal, WritableSignal, isSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { isMethodKey } from '../lib/internal/utilities';

/** Adds fixture.detectChanges after every method call of a signal. */
export function autoDetectChangesSignal<T, S extends Signal<T>>(fixture: ComponentFixture<unknown>, source: S): S
/** Creates a writable signal that has fixture.detectChanges run after every method call. */
export function autoDetectChangesSignal<T>(fixture: ComponentFixture<unknown>, source: T): WritableSignal<T>
export function autoDetectChangesSignal<T, S extends Signal<T>>(fixture: ComponentFixture<unknown>, source: S | T): S | WritableSignal<T> {

  const output = isSignal(source) ? source : signal(source);

  for (const key in output) {
    if (isMethodKey(output, key)) {
      Object.assign(output, {
        [key]: addDetectChangesToFunction(output[key] as () => void)
      });
    }
  }

  return output;

  /** This will wrap autoDetectChanges after the function call. */
  function addDetectChangesToFunction <TArgs extends unknown[], TOut>(fn: (...args: TArgs) => TOut) {
    return (...args: TArgs) => {
      const res = fn.apply(output, args);
      fixture.detectChanges();
      return res;
    }
  }
}
