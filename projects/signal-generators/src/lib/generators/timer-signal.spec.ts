import { Injector, Signal, WritableSignal, signal } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { timerSignal } from './timer-signal';

describe('timerSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  describe('as a timer', () => {
    it('accepts number as the first parameter', fakeAsync(() => {
      const timer = timerSignal(1000, undefined, { injector });
      expect(timer()).toBe(0);
      tick(2000);
      expect(timer()).toBe(1);
    }));

    it('accepts signal as the first parameter', fakeAsync(() => {
      const timerDurationSignal = signal(1000);
      const timer = timerSignal(timerDurationSignal(), undefined, { injector });
      tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
    }));

    it('increases due time if signal increases', fakeAsync(() => {
      const timerDurationSignal = signal(1000);
      const timer = timerSignal(timerDurationSignal, undefined, { injector });
      tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
      setSignal(fixture, timerDurationSignal, 1500);
      tickAndAssertSignalValue(timer, [[ 500, 0 ], [ 500, 1 ]]);
    }));

    it('decreases due time if signal decreases', fakeAsync(() => {
      const timerDurationSignal = signal(1000);
      const timer = timerSignal(timerDurationSignal, undefined, { injector });
      tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
      setSignal(fixture, timerDurationSignal, 500);
      tickAndAssertSignalValue(timer, [[ 1, 1 ]]);
    }));

    it('emits once after specified time.', fakeAsync(() => {
      const timer = timerSignal(1000, undefined, { injector });
      tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
    }));

    describe('#restart', () => {
      it('increments value after initial timer was complete.', fakeAsync(() => {
        const timer = timerSignal(1000, undefined, { injector });
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
        timer.restart();
        tickAndAssertSignalValue(timer, [[ 1000, 2 ]]);
      }));

      it('does not increment value if called before initial timer was complete.', fakeAsync(() => {
        const timer = timerSignal(1000, undefined, { injector });
        tickAndAssertSignalValue(timer, [[0, 0], [ 500, 0 ]]);
        timer.restart();
        tickAndAssertSignalValue(timer, [[ 1000, 1 ]]);
      }));
    });
  });

  /** Sets the signal value and calls detect changes. */
  function setSignal<T>(fixture: MockedComponentFixture<unknown, unknown>, target: WritableSignal<T>, value: T): void {
    target.set(value);
    fixture.detectChanges();
  }

  /** It is a pretty common pattern in these tests to tick, and then expect a signal value */
  function tickAndAssertSignalValue(source: Signal<number>, pattern: [tickValue: number, expectedValue: number][]): void {
    for (const [tickValue, expectedValue] of pattern) {
      if (tickValue > 0) {
        tick(tickValue);
      }
      expect(source()).toBe(expectedValue);
    }
  }
});


