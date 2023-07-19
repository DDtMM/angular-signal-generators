import { Injector, Signal, WritableSignal, signal } from '@angular/core';
import { discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { TimerSignal, timerSignal } from './timer-signal';

describe('timerSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  describe('as a timer', () => {

    it('emits once after specified time.', fakeAsync(() => {
      const timer = timerSignal(1000, undefined, { injector });
      tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
    }));

    describe('with a number for timerSource parameter', () => {
      it('sets a timer for the timerSource amount', fakeAsync(() => {
        const timer = timerSignal(1000, undefined, { injector });
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('with a signal for timerSource parameter', () => {
      /** because timerSignal uses setTimeout it needs to be inside fakeAsync */
      function arrange() {
        const timerDurationSignal = signal(1000);
        const timer = timerSignal(timerDurationSignal, undefined, { injector });
        return { timerDurationSignal, timer };
      };

      it('sets a timer for the timerSource amount', fakeAsync(() => {
        const { timer } = arrange();
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('increases due time if signal increases', fakeAsync(() => {
        const { timerDurationSignal, timer } = arrange();
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        setSignal(fixture, timerDurationSignal, 1500);
        tickAndAssertSignalValue(timer, [[ 500, 0 ], [ 500, 1 ]]);
      }));

      it('decreases due time if signal decreases', fakeAsync(() => {
        const { timerDurationSignal, timer } = arrange();
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        setSignal(fixture, timerDurationSignal, 500);
        tickAndAssertSignalValue(timer, [[ 1, 1 ]]);
      }));
    });

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

    describe('#pause and #resume', () => {
      it('prevents emission over time', fakeAsync(() => {
        const timer = timerSignal(1000, undefined, { injector });
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        timer.pause();
        tickAndAssertSignalValue(timer, [[ 5000, 0 ]]);
      }));

      it('continues after resume', fakeAsync(() => {
        const timer = timerSignal(1000, undefined, { injector });
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        timer.pause();
        tickAndAssertSignalValue(timer, [[ 5000, 0 ]]);
        timer.resume();
        tickAndAssertSignalValue(timer, [[ 500, 1 ]]);
      }));
    });
  });

  fdescribe('as an interval', () => {
    it('emits continuously after timerTime is complete', fakeAsync(() => {
      const timer = timerSignal(1000, 500, { injector });
      tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      timer.pause();
    }));

    describe('with a number for intervalSource parameter', () => {
      it('sets an interval for the intervalSource amount', fakeAsync(() => {
        const timer = timerSignal(1000, 500, { injector });
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
        timer.pause();
      }));
    });

    describe('with a signal for intervalSource parameter', () => {
      /** because timerSignal uses setTimeout it needs to be inside fakeAsync */
      function arrange() {
        const intervalDurationSignal = signal(500);
        const timer = timerSignal(1000, intervalDurationSignal, { injector });
        return { intervalDurationSignal, timer };
      };

      it('sets a timer for the timerSource amount', fakeAsync(() => {
        const { timer } = arrange();
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
        timer.pause();
      }));

      it('increases due time if signal increases', fakeAsync(() => {
        const { intervalDurationSignal, timer } = arrange();
        tickAndAssertSignalValue(timer, [[ 1000, 0 ], [500, 1], [250, 1]]);
        setSignal(fixture, intervalDurationSignal, 750);
        tickAndAssertSignalValue(timer, [[ 500, 2 ], [ 750, 3 ], [750, 4]]);
        timer.pause();
      }));

      it('decreases due time if signal decreases', fakeAsync(() => {
        const { intervalDurationSignal, timer } = arrange();
        tickAndAssertSignalValue(timer, [[ 1000, 0 ], [500, 1], [250, 1]]);
        setSignal(fixture, intervalDurationSignal, 250);
        tickAndAssertSignalValue(timer, [[ 1, 2 ], [ 250, 3 ], [250, 4]]);
        timer.pause();
      }));
    });
  });
  /** Sets the signal value and calls detect changes. */
  function setSignal<T>(fixture: MockedComponentFixture<unknown, unknown>, target: WritableSignal<T>, value: T): void {
    target.set(value);
    fixture.detectChanges();
  }

  /** It is a pretty common pattern in these tests to tick, and then expect a signal value */
  function tickAndAssertSignalValue<T>(source: Signal<T>, pattern: [tickValue: number, expectedValue: T][]): void {
    for (const [tickValue, expectedValue] of pattern) {
      tick(tickValue);
      expect(source()).toBe(expectedValue);
    }
  }
});


