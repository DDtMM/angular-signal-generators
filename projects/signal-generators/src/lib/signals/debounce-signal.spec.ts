import { signal } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { runComputedAndEffectTests, runDebugNameOptionTest, runInjectorOptionTest, runTypeGuardTests } from '../../testing/common-signal-tests';
import { tickAndAssertValues } from '../../testing/testing-utilities';
import { debounceSignal } from './debounce-signal';

describe('debounceSignal', () => {

  describe('when created with a signal', () => {
    runDebugNameOptionTest((debugName) => debounceSignal(signal(1), 500, { debugName }));
    runInjectorOptionTest((injector) => debounceSignal(signal(1), 500, { injector }));
    runTypeGuardTests(() => debounceSignal(signal(1), 500));

    runComputedAndEffectTests(() => {
      const $source = signal(1);
      return [debounceSignal($source, 500), () => $source.set(2)];
    });

    it('initially shows the source value', () => {
      const $source = signal(1);
      const sut = TestBed.runInInjectionContext(() => debounceSignal($source, 500));
      expect(sut()).toBe($source());
    });

    it('should not change value until time of last source change equals debounce time', fakeAsync(() => {
      const originalValue = 1;
      const $source = signal(originalValue);
      const sut = TestBed.runInInjectionContext(() => debounceSignal($source, 500));
      tickAndAssertValues(sut, [[100, originalValue]]);
      $source.set(2);
      tickAndAssertValues(sut, [[499, originalValue], [1, $source()]]);
      $source.set(3);
      tickAndAssertValues(sut, [[500, $source()]]);
    }));

    it('should adjust debounce time when time from a signal changes', fakeAsync(() => {
      const originalValue = 1;
      const $debounceTime = signal(500);
      const $source = signal(originalValue);
      const sut = TestBed.runInInjectionContext(() => debounceSignal($source, $debounceTime));
      tickAndAssertValues(sut, [[100, originalValue]]);
      $source.set(2);
      $debounceTime.set(5000);
      tickAndAssertValues(sut, [[500, originalValue], [4500, $source()]]);
    }));
  });


  describe('when created from a value', () => {
    runDebugNameOptionTest((debugName) => debounceSignal(1, 500, { debugName }));
    runInjectorOptionTest((injector) => debounceSignal(1, 500, { injector }));
    runTypeGuardTests(() => debounceSignal(1, 500));

    runComputedAndEffectTests(() => {
      const sut = debounceSignal(1, 500);
      return [sut, () => sut.set(2)];
    });
    it('should respect the equal option if passed', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => debounceSignal(4, 500, { equal: (a, b) => (a % 2) === (b % 2) }));
      sut.set(8); // should be skipped since equal function checks on evenness.
      tickAndAssertValues(sut, [[500, 4]]);
      sut.set(7);
      tickAndAssertValues(sut, [[500, 7]]);
    }));
    it('#set should be debounced', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => debounceSignal('x', 500));
      tickAndAssertValues(sut, [[100, 'x']]);
      sut.set('z');
      tickAndAssertValues(sut, [[499, 'x'], [1, 'z']]);
    }));
    it('#update should be debounced', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => debounceSignal('x', 500));
      tickAndAssertValues(sut, [[100, 'x']]);
      sut.update((x) => x + 'z');
      tickAndAssertValues(sut, [[499, 'x'], [1, 'xz']]);
    }));
    it('#asReadonly returns signal that reflects source signal value', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => debounceSignal('x', 500));
      const $readonly = sut.asReadonly();
      expect($readonly()).toEqual(sut());
      sut.set('y')
      tickAndAssertValues($readonly, [[499, 'x']]);
      tickAndAssertValues($readonly, [[1, 'y']]);
    }));
  });
});
