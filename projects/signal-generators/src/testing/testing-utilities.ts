import { tick } from '@angular/core/testing';

/** It is a pretty common pattern in these tests to tick, and then expect a value.
 * @param selector gets value from a function.
 * @param pattern A tuple of ticks and expected values.
 */
export function tickAndAssertValue<T>(selector: () => T,
  pattern: [elapsedMs: number, expectedValue: T][]): void {
  // instead of having expect in loop, store them all and have one assertion at the end.
  const results: T[] = [];
  for (const [elapsedMs] of pattern) {
    tick(elapsedMs);
    results.push(selector());
  }
  const times = pattern.map(x => x[0])
    .map((_, i, ary) => `[${i}]: ${ary.slice(0, i + 1).reduce((acc, x) => acc + x)}`)
  expect(results)
    .withContext(`At times ${times.join(', ')}`)
    .toEqual(pattern.map(x => x[1]));
}
