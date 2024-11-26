import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';

/**
 * Creates a {@link ComponentFixture} from a dummy component.
 * This is probably temporary as ngMocks is not working since moving to Angular 19 beta.
 * We ***don't*** want to be maintaining our own testing library.
*/
export function createFixture(): ComponentFixture<unknown> {
  @Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
  class DummyComponent { }
  return TestBed.createComponent(DummyComponent);
}

/** It is a pretty common pattern in these tests to tick, and then expect a value.
 * @param selector gets value from a function.
 * @param pattern A tuple of tick times and expected values.
 * @example
 * fakeAsync(() => {
 *   const sut = tweenSignal(1, { injector, duration: 500 });
 *   sut.set(5);
 *   tickAndAssertValue(() => Math.round(sut()), [[0, 1], [250, 3]]);
 * }));
 */
export function tickAndAssertValues<T>(selector: () => T, pattern: readonly(readonly [elapsedMs: number, expectedValue: T])[]): void {
  // instead of having expect in loop, store them all and have one assertion at the end.
  const results: T[] = [];
  for (const [elapsedMs] of pattern) {
    tick(elapsedMs);
    results.push(selector());
  }
  const times = pattern.map((x) => x[0]).map((_, i, ary) => `[${i}]: ${ary.slice(0, i + 1).reduce((acc, x) => acc + x)}`);
  expect(results)
    .withContext(`At times ${times.join(', ')}`)
    .toEqual(pattern.map((x) => x[1]));
}

/**
 * Returns an array of tuples of elapsedMs and the value observed at that time.
 * @param selector gets value from a function.
 * @param elapsedMsTimes The amount of time from the last tick until the next tick.
 */
export function tickAndRecordValues<T>(selector: () => T, elapsedMsTimes: number[]): [elapsedMs: number, recordedValue: T][] {
  // instead of having expect in loop, store them all and have one assertion at the end.
  const results: [elapsedMs: number, recordedValue: T][] = [];
  for (const elapsedMs of elapsedMsTimes) {
    tick(elapsedMs);
    results.push([elapsedMs, selector()]);
  }
  return results;
}

/**
 * Replaces a property on globalThis and returns a function to restore it.
 * Probably a good idea to do something more robust since an exception could prevent restoration.
 * @example
 * ``` ts
 * it('should do something', () => {
 *   const restoreProperty = replaceGlobalProperty('MutationObserver', undefined);
 *   // do stuff ...
 *   restoreProperty();
 * });
 * ```
 */
export function replaceGlobalProperty(key: PropertyKey, value: unknown): () => void {
  const priorValue = (globalThis as Record<PropertyKey, unknown>)[key];
  Object.defineProperty(globalThis, key, { value });
  return () => Object.defineProperty(globalThis, key, { value: priorValue });
}
