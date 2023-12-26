import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { filterSignal } from './filter-signal';

describe('filterSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => {
    fixture = MockRender();
  });

  setupTypeGuardTests(() => filterSignal<number>(1, x => x < 5));

  setupComputedAndEffectTests(() => {
    const sut = filterSignal<number>(1, x => x < 5);
    return [sut, () => sut.set(2)];
  }, () => fixture);

  it('filters values based on a boolean condition', () => {
    const sut = filterSignal<number>(1, x => x < 5);
    expect(sut()).toBe(1);
    sut.set(8);
    expect(sut()).toBe(1);
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
