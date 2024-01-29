import { Signal, WritableSignal, isSignal, signal } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { isMethodKey } from '../lib/internal/utilities';

interface AutoDetectChangesSignalOptions {
  /** If in fakeAsync context call tick in addition to detectChanged */
  tickAfter?: boolean;
}
/** Adds fixture.detectChanges after every method call of a signal. */
export function autoDetectChangesSignal<T, S extends Signal<T>>(
  fixture: ComponentFixture<unknown>,
  source: S,
  options?: AutoDetectChangesSignalOptions
): S;
/** Creates a writable signal that has fixture.detectChanges run after every method call. */
export function autoDetectChangesSignal<T>(
  fixture: ComponentFixture<unknown>,
  source: T,
  options?: AutoDetectChangesSignalOptions
): WritableSignal<T>;
export function autoDetectChangesSignal<T, S extends Signal<T>>(
  fixture: ComponentFixture<unknown>,
  source: S | T,
  options?: AutoDetectChangesSignalOptions
): S | WritableSignal<T> {
  const detectChanges = createDetectChangesFn();
  const output = isSignal(source) ? source : signal(source);

  for (const key in output) {
    if (isMethodKey(output, key)) {
      Object.assign(output, {
        [key]: addDetectChangesToFunction(output[key] as () => void)
      });
    }
  }
  detectChanges();
  return output;

  /** This will wrap autoDetectChanges after the function call. */
  function addDetectChangesToFunction<TArgs extends unknown[], TOut>(fn: (...args: TArgs) => TOut) {
    return (...args: TArgs) => {
      const res = fn.apply(output, args);
      detectChanges();
      return res;
    };
  }

  /** Creates a function to call after changes. */
  function createDetectChangesFn(): () => void {
    if (options?.tickAfter) {
      return () => {
        fixture.detectChanges();
        tick();
      };
    }
    return () => fixture.detectChanges();
  }
}
