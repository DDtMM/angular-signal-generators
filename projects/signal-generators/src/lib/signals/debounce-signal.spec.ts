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
      const source = signal(1);
      return [debounceSignal(source, 500, { injector }), () => source.set(2)];
    }, () => fixture);


    it('initially shows the source value', fakeAsync(() => {
      const source = signal(1);
      const debounced = debounceSignal(source, 500, { injector });
      expect(debounced()).toBe(source());
    }));

    it('should not change value until time of last source change equals debounce time', fakeAsync(() => {
      const originalValue = 1;
      const source = autoDetectChangesSignal(fixture, signal(originalValue));
      const debounced = debounceSignal(source, 500, { injector });
      tickAndAssertValues(debounced, [[100, originalValue]]);
      source.set(2);
      tickAndAssertValues(debounced, [[499, originalValue], [1, source()]]);
      source.set(3);
      tickAndAssertValues(debounced, [[500, source()]]);
    }));

    it('should adjust debounce time when time from a signal changes', fakeAsync(() => {
      const originalValue = 1;
      const debounceTime = autoDetectChangesSignal(fixture, signal(500));
      const source = autoDetectChangesSignal(fixture, signal(originalValue));
      const debounced = autoDetectChangesSignal(fixture, debounceSignal(source, debounceTime, { injector }));
      tickAndAssertValues(debounced, [[100, originalValue]]);
      source.set(2);
      debounceTime.set(5000);
      tickAndAssertValues(debounced, [[500, originalValue], [4500, source()]]);
    }));
  });


  describe('when created from a value', () => {
    setupComputedAndEffectTests(() => {
      const sut = debounceSignal(1, 500, { injector });
      return [sut, () => sut.set(2)];
    }, () => fixture);

    it('#set should be debounced', fakeAsync(() => {
      const debounced = autoDetectChangesSignal(fixture, debounceSignal('x', 500, { injector }));
      tickAndAssertValues(debounced, [[100, 'x']]);
      debounced.set('z');
      tickAndAssertValues(debounced, [[499, 'x'], [1, 'z']]);
    }));
    it('#update should be debounced', fakeAsync(() => {
      const debounced = autoDetectChangesSignal(fixture, debounceSignal('x', 500, { injector }));
      tickAndAssertValues(debounced, [[100, 'x']]);
      debounced.update((x) => x + 'z');
      tickAndAssertValues(debounced, [[499, 'x'], [1, 'xz']]);
    }));
    it('asReadonly just returns itself', () => {
      const debounced = debounceSignal('x', 500, { injector });
      const asReadonlyResult = debounced.asReadonly();
      expect(asReadonlyResult).toBe(debounced);
    });
  });
});
