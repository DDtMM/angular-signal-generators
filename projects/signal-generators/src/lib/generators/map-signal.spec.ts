import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { mapSignal } from './map-signal';
import { WritableSignal, signal } from '@angular/core';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';

describe('mapSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => {
    fixture = MockRender();
  });

  setupTypeGuardTests(() => mapSignal(1, (x) => x + 1));

  it('throws if not enough parameters are passed', () => {
    expect(() => (mapSignal as unknown as (x: number) => void)(1)).toThrow();
  })

  describe('when passed signals', () => {
    let signal1: WritableSignal<number>;
    let signal2: WritableSignal<number>;
    beforeEach(() => {
      signal1 = autoDetectChangesSignal(fixture, signal(3));
      signal2 = autoDetectChangesSignal(fixture, signal(5));
    });
    setupComputedAndEffectTests(() => {
      const source = signal(1);
      const sut = mapSignal(source, x => x + 1);
      return [sut, () => { source.set(2) }];
    }, () => fixture);
    it('the typings are correct for a single signal', () => {
      const source = mapSignal(signal1, (a) => a + 1);
      expect(source()).toBe(4);
    });
    it('initially returns mapped value', () => {
      const source = mapSignal(signal1, signal2, (a, b) => a * b + 1);
      expect(source()).toBe(16);
    });
    it('can be mapped from signals of different types.', () => {
      const textSignal = signal('The value of a + b is: ');
      const source = mapSignal(signal1, signal2, textSignal, (a, b, text) => `${text}${a + b}`);
      signal1.set(10);
      expect(source()).toBe(`The value of a + b is: 15`);
    });
    it('respects options.equal value', () => {
      const source = mapSignal(signal1, signal2, (a, b) => a * b, { equal: (_, b: number) => b % 2 === 1 });
      expect(source()).toBe(15); // this is a little dodgy, equal won't run if it doesn't think the signal is being listened to.
      signal1.set(5);
      expect(source()).toBe(15); // this should NOT change because of silly equal function.
      signal1.set(6);
      expect(source()).toBe(30);
    });
    it('updates when an input signal changes', () => {
      const source = mapSignal(signal1, signal2, (a, b) => a * b + 1);
      signal1.set(10);
      expect(source()).toBe(51);
    });
  });
  describe('when passed a value', () => {
    setupComputedAndEffectTests(() => {
      const sut = mapSignal(1, x => x + 1);
      return [sut, () => { sut.set(2) }];
    }, () => fixture);
    it('initially returns mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3));
      expect(source()).toBe(3);
    });
    it('#asReadonly returns itself', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal({ value: 1 }, (x) => ( { value: x.value * 3 })));
      expect(source.asReadonly()).toBe(source);
    });
    it('#input returns signal containing input value', () => {
      const source = mapSignal(1, (x) => x * 3);
      expect(source.input()).toBe(1);
    });
    it('#set sets signal to mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3));
      source.set(2);
      expect(source()).toBe(6);
    });
    it('#update sets signal to mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3));
      source.update((x) => x + 5);
      expect(source()).toBe(18);
    });
    it('respects options.equal value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x + 1, { equal: (_, b) => b % 2 === 0 }));
      source(); // this is a little dodgy, equal won't run if it doesn't think the signal is being listened to.
      source.set(3);
      expect(source()).toBe(2); // this should NOT change because of silly equal function.
      source.set(4);
      expect(source()).toBe(5);
    });
    it('changes value when signal inside selector changes value', () => {
      const selectorValue = autoDetectChangesSignal(fixture, 1);
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x + selectorValue()));
      selectorValue.set(5);
      expect(source()).toBe(6);
    });
  });
});
