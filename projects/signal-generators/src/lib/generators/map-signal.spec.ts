import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { mapSignal } from './map-signal';

describe('mapSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => {
    fixture = MockRender();
  });

  describe('as non-computed', () => {
    it('initially returns mapped value', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x * 3));
      expect(source()).toBe(3);
    });
    it('#asReadonly returns itself', () => {
      const source = autoDetectChangesSignal(fixture, mapSignal({ value: 1 }, (x) => ( { value: x.value * 3 })));
      expect(source.asReadonly()).toBe(source);
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
      const source = autoDetectChangesSignal(fixture, mapSignal(1, (x) => x + 1, { equal: (x) =>  x % 2 === 0 }));
      source.set(3);
      expect(source()).toBe(2); // this should NOT change because of silly equal function.
      source.set(4);
      expect(source()).toBe(5);
    });
  });


});
