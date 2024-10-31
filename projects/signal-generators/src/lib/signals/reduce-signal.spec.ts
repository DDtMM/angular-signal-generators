import { runComputedAndEffectTests, runDebugNameOptionTest, runDoesNotCauseReevaluationsSimplyWhenNested, runTypeGuardTests } from '../../testing/common-signal-tests';
import { reduceSignal } from './reduce-signal';

describe('reduceSignal', () => {
  runDebugNameOptionTest((debugName) => reduceSignal(1, (p, c) => p + c, { debugName }));
  runTypeGuardTests(() => reduceSignal(1, (p, c) => p + c));
  runComputedAndEffectTests(() => {
    const sut = reduceSignal(1, (p, c) => p + c);
    return [sut, () => { sut.set(1) }];
  });
  runDoesNotCauseReevaluationsSimplyWhenNested(
    () => reduceSignal(1, (p, c) => p + c),
    (sut) => sut.set(1)
  );
  it('initially returns initialValue', () => {
    const sut = reduceSignal(1, (p, c) => p + c);
    expect(sut()).toBe(1);
  });
  it('should respect the equals option if passed', () => {
    const sut = reduceSignal(2, (p, c) => p + c, { equal: (a, b) => a % 2 === b % 2 });
    sut.set(1);
    expect(sut()).toBe(3);
    sut.set(2); // should be skipped since equal function checks on evenness.
    expect(sut()).toBe(3);
  });
  it('uses reducer with argument passed to set', () => {
    const sut = reduceSignal(1, (p, c) => p + c);
    sut.set(1)
    expect(sut()).toBe(2);
  });
  it('uses results with result of updateFn argument passed to update', () => {
    const sut = reduceSignal(1, (p, c) => p + c);
    sut.update(x => x + 3)
    expect(sut()).toBe(5);
  });
  it('#asReadonly returns a signal that reflects the original', () => {
    const sut = reduceSignal(2, (p, c) => p + c);
    const $readonly = sut.asReadonly();
    sut.set(5);
    expect(sut()).toBe(7);
    expect(sut()).toEqual($readonly());
  });
});
