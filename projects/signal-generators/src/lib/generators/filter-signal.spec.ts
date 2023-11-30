import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { setupGeneralSignalTests } from '../../testing/general-signal-tests.spec';
import { filterSignal } from './filter-signal';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { signal } from '@angular/core';

describe('filterSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => {
    fixture = MockRender();
  });

  setupGeneralSignalTests(() => filterSignal<number>(1, x => x < 5));


  describe('from value', () => {
    it('filters values based on a boolean condition', () => {
      const sut = filterSignal<number>(1, x => x < 5);
      expect(sut()).toBe(1);
      sut.set(8);
      expect(sut()).toBe(1);
      sut.set(4);
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

  describe('from signal', () => {
    it('filters values based on a boolean condition', () => {
      const source = autoDetectChangesSignal(fixture, signal(1));
      const sut = filterSignal<number>(source, x => x < 5);
      expect(sut()).toBe(1);
      source.set(8);
      expect(sut()).toBe(1);
      source.set(4);
      expect(sut()).toBe(4);
    });

    it('filters values when used as a guard', () => {
      const source = autoDetectChangesSignal(fixture, signal('eric'));
      const sut = filterSignal(source, (x): x is 'eric' | 'tim' => (['eric', 'tim']).includes(x));
      expect(sut()).toBe('eric');
      source.set('joe');
      expect(sut()).toBe('eric');
      source.set('tim');
      expect(sut()).toBe('tim');
      source.set('james');
      expect(sut()).toBe('tim');
    });

    it('will return undefined when no initialValidValue is passed in options', () => {
      const source = autoDetectChangesSignal(fixture, signal('john'));
      const sut = filterSignal(source, (x: string): x is 'eric' | 'tim' => (['eric', 'tim']).includes(x));
      expect(sut()).toBe(undefined);
      source.set('joe');
      expect(sut()).toBe(undefined);
      source.set('tim');
      expect(sut()).toBe('tim');
      source.set('james');
      expect(sut()).toBe('tim');
    });

    it('will return initialValidValue when initialValidValue is passed in options', () => {
      const source = autoDetectChangesSignal(fixture, signal('john'));
      const sut = filterSignal(source, (x: string): x is 'eric' | 'tim' => (['eric', 'tim']).includes(x), { initialValidValue: 'eric' as const });
      expect(sut()).toBe('eric');
      source.set('joe');
      expect(sut()).toBe('eric');
      source.set('tim');
      expect(sut()).toBe('tim');
      source.set('james');
      expect(sut()).toBe('tim');
    });
  });
});