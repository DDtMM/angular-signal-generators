import { Injector, signal } from '@angular/core';
import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { debounceSignal } from './debounce-signal';
import { fakeAsync } from '@angular/core/testing';
import { tickAndAssertValue } from '../../testing/testing-utilities';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';


describe('debounceSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  it('initially shows the source value', fakeAsync(() => {
    const source = signal(1);
    const debounced = debounceSignal(source, 500, { injector });
    expect(debounced()).toBe(source());
  }));

  it('should not change value until time of last source change equals debounce time', fakeAsync(() => {
    const originalValue = 1;
    const source = autoDetectChangesSignal(fixture, signal(originalValue));
    const debounced = debounceSignal(source, 500, { injector });
    tickAndAssertValue(debounced, [[100, originalValue]]);
    source.set(2);
    tickAndAssertValue(debounced, [[499, originalValue], [1, source()]]);
    source.set(3);
    tickAndAssertValue(debounced, [[500, source()]]);
  }));

  it('should adjust debounce time when time from a signal changes', fakeAsync(() => {
    const originalValue = 1;
    const debounceTime = autoDetectChangesSignal(fixture, signal(500));
    const source = autoDetectChangesSignal(fixture, signal(originalValue));
    const debounced = autoDetectChangesSignal(fixture, debounceSignal(source, debounceTime, { injector }));
    tickAndAssertValue(debounced, [[100, originalValue]]);
    source.set(2);
    debounceTime.set(5000);
    tickAndAssertValue(debounced, [[500, originalValue], [4500, source()]]);
  }));

  describe('when created from writable overload', () => {
    it('#set should be debounced', fakeAsync(() => {
      const debounced = autoDetectChangesSignal(fixture, debounceSignal('x', 500, { injector }));
      tickAndAssertValue(debounced, [[100, 'x']]);
      debounced.set('z');
      tickAndAssertValue(debounced, [[499, 'x'], [1, 'z']]);
    }));
    it('#update should be debounced', fakeAsync(() => {
      const debounced = autoDetectChangesSignal(fixture, debounceSignal('x', 500, { injector }));
      tickAndAssertValue(debounced, [[100, 'x']]);
      debounced.update((x) => x + 'z');
      tickAndAssertValue(debounced, [[499, 'x'], [1, 'xz']]);
    }));
    it('asReadonly just returns itself', () => {
      const debounced = debounceSignal('x', 500, { injector });
      const asReadonlyResult = debounced.asReadonly();
      expect(asReadonlyResult).toBe(debounced);
    });
  });
});
