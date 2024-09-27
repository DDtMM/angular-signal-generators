import { setupComputedAndEffectTests, setupDoesNotCauseReevaluationsSimplyWhenNested, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { filterSignal } from './filter-signal';

describe('filterSignal', () => {

  setupTypeGuardTests(() => filterSignal<number>(1, x => x < 5));

  setupDoesNotCauseReevaluationsSimplyWhenNested(
    () => filterSignal<number>(1, x => x < 5),
    (sut) => sut.set(4)
  );

  setupComputedAndEffectTests(() => {
    const sut = filterSignal<number>(1, x => x < 5);
    return [sut, () => sut.set(2)];
  });

  it('filters values based on a boolean condition', () => {
    const sut = filterSignal<number>(1, x => x < 5);
    expect(sut()).toBe(1);
    sut.set(8);
    expect(sut()).toBe(1);
    sut.set(4);
    expect(sut()).toBe(4);
  });

  it('uses equalFn when passed to options', () => {
    const sut = filterSignal<number>(1, x => x < 5, { equal: (a, b) => a % 2 === b % 2 });
    expect(sut()).toBe(1);
    sut.set(3);
    expect(sut()).toBe(1); // since the are both still odd, the value should not change.
    sut.set(4);
    expect(sut()).toBe(4);
  });

  it('doesn\'t miss a value change', () => {
    const sut = filterSignal<number>(1, x => x < 5);
    expect(sut()).toBe(1);
    sut.set(6);
    sut.set(4)
    sut.set(8);
    expect(sut()).toBe(4);
  });

  it('filters values when used as a guard', () => {
    const sut = filterSignal('eric' as const, (x: string): x is 'eric' | 'tim' => (['eric', 'tim']).includes(x));
    expect(sut()).toBe('eric');
    sut.set('joe');
    expect(sut()).toBe('eric');
    sut.set('tim');
    expect(sut()).toBe('tim');
    sut.set('james');
    expect(sut()).toBe('tim');
  });

  it('filters values when update is used.', () => {
    const sut = filterSignal({ value: 1 }, (x: { value: number }) => x.value < 5);
    expect(sut()).toEqual({ value: 1 });
    sut.update(x => ({ ...x, value: 5 }));
    expect(sut()).toEqual({ value: 1 });
    sut.update(x => ({ ...x, value: 4 }));
    expect(sut()).toEqual({ value: 4 });
  });

});
