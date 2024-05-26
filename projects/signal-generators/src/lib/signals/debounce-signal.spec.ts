import { Injector, signal } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { tickAndAssertValues } from '../../testing/testing-utilities';
import { debounceSignal } from './debounce-signal';

describe('debounceSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  setupTypeGuardTests(() => debounceSignal(1, 500, { injector }));

  describe('when created with a signal', () => {
    setupComputedAndEffectTests(() => {
      const $source = signal(1);
      return [debounceSignal($source, 500, { injector }), () => $source.set(2)];
    });

    it('initially shows the source value', () => {
      const $source = signal(1);
      const sut = debounceSignal($source, 500, { injector });
      expect(sut()).toBe($source());
    });

    it('should not change value until time of last source change equals debounce time', fakeAsync(() => {
      const originalValue = 1;
      const $source = autoDetectChangesSignal(fixture, signal(originalValue));
      const sut = debounceSignal($source, 500, { injector });
      tickAndAssertValues(sut, [[100, originalValue]]);
      $source.set(2);
      tickAndAssertValues(sut, [[499, originalValue], [1, $source()]]);
      $source.set(3);
      tickAndAssertValues(sut, [[500, $source()]]);
    }));

    it('should adjust debounce time when time from a signal changes', fakeAsync(() => {
      const originalValue = 1;
      const $debounceTime = autoDetectChangesSignal(fixture, signal(500));
      const $source = autoDetectChangesSignal(fixture, signal(originalValue));
      const sut = autoDetectChangesSignal(fixture, debounceSignal($source, $debounceTime, { injector }));
      tickAndAssertValues(sut, [[100, originalValue]]);
      $source.set(2);
      $debounceTime.set(5000);
      tickAndAssertValues(sut, [[500, originalValue], [4500, $source()]]);
    }));
  });


  describe('when created from a value', () => {
    setupComputedAndEffectTests(() => {
      const sut = debounceSignal(1, 500, { injector });
      return [sut, () => sut.set(2)];
    });
    it('should respect the equals option if passed', fakeAsync(() => {
      const sut = debounceSignal(4, 500, { injector, equal: (a, b) => (a % 2) === (b % 2) });
      sut.set(8); // should be skipped since equal function checks on evenness.
      tickAndAssertValues(sut, [[500, 4]]);
      sut.set(7);
      tickAndAssertValues(sut, [[500, 7]]);
    }));
    it('#set should be debounced', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, debounceSignal('x', 500, { injector }));
      tickAndAssertValues(sut, [[100, 'x']]);
      sut.set('z');
      tickAndAssertValues(sut, [[499, 'x'], [1, 'z']]);
    }));
    it('#update should be debounced', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, debounceSignal('x', 500, { injector }));
      tickAndAssertValues(sut, [[100, 'x']]);
      sut.update((x) => x + 'z');
      tickAndAssertValues(sut, [[499, 'x'], [1, 'xz']]);
    }));
    it('asReadonly just returns itself', () => {
      const sut = debounceSignal('x', 500, { injector });
      const asReadonlyResult = sut.asReadonly();
      expect(asReadonlyResult).toBe(sut);
    });
  });
});
