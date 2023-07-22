import { tick } from '@angular/core/testing';

/** It is a pretty common pattern in these tests to tick, and then expect a value */
export function tickAndAssertValue<T>(selector: () => T, pattern: [elapsedMs: number, expectedTicks: T][]): void {
  // instead of having expect in loop, store them all and have one assertion at the end.
  const results: T[] = [];
  for (const [elapsedMs] of pattern) {
    tick(elapsedMs);
    results.push(selector());
  }
  expect(results).toEqual(pattern.map(x => x[1]));
}
