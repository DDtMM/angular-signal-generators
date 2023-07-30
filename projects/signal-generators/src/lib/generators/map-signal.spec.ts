import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { mapSignal } from './map-signal';

describe('mapSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => {
    fixture = MockRender();
  });

  describe('when selector is not tracked', () => {
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
    it('#mutate sets signal to mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal({ value: 1 }, (x) => ( { value: x.value * 3 })));
      source.mutate((x) => x.value = 2);
      expect(source()).toEqual({ value: 6 });
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
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x + 1, { equal: (_, b) =>  b % 2 === 0 }));
      source.set(3);
      expect(source()).toBe(2); // this should NOT change because of silly equal function.
      source.set(4);
      expect(source()).toBe(5);
    });
  });

  describe('when selector is tracked', () => {
    it('initially returns mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3, { trackSelector: true }));
      expect(source()).toBe(3);
    });
    it('respects options.equal value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x + 1, { equal: (_, b) => b % 2 === 0, trackSelector: true }));
      source(); // this is a little dodgy, equal won't run if it doesn't think the signal is being listened to.
      source.set(3);
      expect(source()).toBe(2); // this should NOT change because of silly equal function.
      source.set(4);
      expect(source()).toBe(5);
    });
    it('changes value when signal inside selector changes value', () => {
      const selectorValue = autoDetectChangesSignal(fixture, 1);
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x + selectorValue(), { trackSelector: true  }));
      selectorValue.set(5);
      expect(source()).toBe(6);
    });
    it('#asReadonly returns itself', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3, { trackSelector: true }));
      expect(source.asReadonly()).toBe(source);
    });
    it('#input returns signal containing input value', () => {
      const source = mapSignal(1, (x) => x * 3, { trackSelector: true });
      expect(source.input()).toBe(1);
    });
    it('#mutate sets signal to mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal({ value: 1 }, (x) => ( { value: x.value * 3 }), { trackSelector: true }));
      source.mutate((x) => x.value = 2);
      fixture.detectChanges(); // because an inner selector signal is used, the change is missed due to the reference.
      expect(source()).toEqual({ value: 6 });
    });
    it('#set sets signal to mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3, { trackSelector: true }));
      source.set(2);
      expect(source()).toBe(6);
    });
    it('#update sets signal to mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3, { trackSelector: true }));
      source.update((x) => x + 5);
      expect(source()).toBe(18);
    });
  });

});
