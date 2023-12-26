import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { reduceSignal } from './reduce-signal';

describe('reduceSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => {
    fixture = MockRender();
  });

  setupTypeGuardTests(() => reduceSignal(1, (p, c) => p + c));
  setupComputedAndEffectTests(() => {
    const sut = reduceSignal(1, (p, c) => p + c);
    return [sut, () => { sut.set(1) }];
  }, () => fixture);
  it('initially returns initialValue', () => {
    const sut = reduceSignal(1, (p, c) => p + c);
    expect(sut()).toBe(1);
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

});
