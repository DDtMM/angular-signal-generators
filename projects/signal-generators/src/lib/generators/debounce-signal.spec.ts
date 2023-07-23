import { Injector, signal } from '@angular/core';
import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { debounceSignal } from './debounce-signal';
import { fakeAsync } from '@angular/core/testing';
import { tickAndAssertValue } from '../../testing/testing-utilities';


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
    const source = signal(originalValue);
    const debounced = debounceSignal(source, 500, { injector });
    tickAndAssertValue(debounced, [[100, originalValue]]);
    source.set(2);
    fixture.detectChanges();
    tickAndAssertValue(debounced, [[499, originalValue], [1, source()]]);
    source.set(3);
    fixture.detectChanges();
    tickAndAssertValue(debounced, [[500, source()]]);
  }));

  it('should adjust debounce time when time from a signal changes', fakeAsync(() => {
    const originalValue = 1;
    const debounceTime = signal(500);
    const source = signal(originalValue);
    const debounced = debounceSignal(source, debounceTime, { injector });
    tickAndAssertValue(debounced, [[100, originalValue]]);
    source.set(2);
    debounceTime.set(5000)
    fixture.detectChanges();
    tickAndAssertValue(debounced, [[500, originalValue], [4500, source()]]);
  }));

  describe('when created from writable overload', () => {
    it('#set should be debounced', fakeAsync(() => {
      const debounced = debounceSignal('x', 500, { injector });
      tickAndAssertValue(debounced, [[100, 'x']]);
      debounced.set('z');
      fixture.detectChanges();
      tickAndAssertValue(debounced, [[499, 'x'], [1, 'z']]);
    }));
    it('#update should be debounced', fakeAsync(() => {
      const debounced = debounceSignal('x', 500, { injector });
      tickAndAssertValue(debounced, [[100, 'x']]);
      debounced.update((x) => x + 'z');
      fixture.detectChanges();
      tickAndAssertValue(debounced, [[499, 'x'], [1, 'xz']]);
    }));
  });
});
