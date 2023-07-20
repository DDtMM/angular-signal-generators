import { Injector, Signal, WritableSignal, signal } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { TimeSource, TimerSignal, timerSignal } from './timer-signal';

describe('timerSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  describe('as a timer', () => {

    it('emits once after specified time.', testTimer(100, undefined, (timer) => {
      tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
    }));

    describe('with a number for timerSource parameter', () => {
      it('sets a timer for the timerSource amount', testTimer(100, undefined, (timer) => {
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('with a signal for timerSource parameter', () => {
      it('sets a timer for the timerSource amount', testTimer(signal(1000), undefined, (timer) => {
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('increases due time if signal increases', testTimer(signal(1000), undefined, (timer, timerDurationSignal) => {
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        setSignal(fixture, timerDurationSignal, 1500);
        tickAndAssertSignalValue(timer, [[ 500, 0 ], [ 500, 1 ]]);
      }));

      it('decreases due time if signal decreases', testTimer(signal(1000), undefined, (timer, timerDurationSignal) => {
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        setSignal(fixture, timerDurationSignal, 500);
        tickAndAssertSignalValue(timer, [[ 1, 1 ]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value', testTimer(1000, undefined, (timer) => {
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
        timer.restart();
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('interrupts an existing timer.', testTimer(1000, undefined, (timer) => {
        tickAndAssertSignalValue(timer, [[0, 0], [ 500, 0 ]]);
        timer.restart();
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('pause and resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, undefined, (timer) => {
        tickAndAssertSignalValue(timer, [[ 500, 0 ]]);
        timer.pause();
        tickAndAssertSignalValue(timer, [[ 5000, 0 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, undefined, (timer) => {
        tickAndAssertSignalValue(timer, [[ 999, 0 ]]);
        timer.pause();
        tickAndAssertSignalValue(timer, [[ 5000, 0 ]]);
        timer.resume();
        tickAndAssertSignalValue(timer, [[ 1, 1 ]]);
      }));
    });
  });

  describe('as an interval', () => {
    it('emits continuously after timerTime is complete', testTimer(1000, 500, (timer) => {
      tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
    }));

    describe('with a number for intervalSource parameter', () => {
      it('sets an interval for the intervalSource amount', testTimer(1000, 500, (timer) => {
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));
    });

    describe('with a signal for intervalSource parameter', () => {
      it('sets a timer for the timerSource amount', testTimer(1000, signal(500), (timer) => {
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));

      it('increases due time if signal increases', testTimer(1000, signal(500), (timer, _, intervalDurationSignal) => {
        tickAndAssertSignalValue(timer, [[ 1750, 2]]);
        setSignal(fixture, intervalDurationSignal, 750);
        tickAndAssertSignalValue(timer, [[ 500, 3 ], [ 750, 4 ], [750, 5]]);
      }));

      it('decreases due time if signal decreases', testTimer(1000, signal(500), (timer, _, intervalDurationSignal) => {
        tickAndAssertSignalValue(timer, [[ 1750, 2]]);
        setSignal(fixture, intervalDurationSignal, 250);
        tickAndAssertSignalValue(timer, [[ 0, 3 ], [ 250, 4 ], [250, 5]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value and begins from initial timer', testTimer(1000, 500, (timer) => {
        tickAndAssertSignalValue(timer, [[ 1750, 2]]);
        timer.restart();
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));

      it('interrupts an existing interval.', testTimer(1000, 500, (timer) => {
        tickAndAssertSignalValue(timer, [[ 1750, 2]]);
        timer.restart();
        tickAndAssertSignalValue(timer, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));
    });
    describe('#pause and #resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, 500, (timer) => {
        tickAndAssertSignalValue(timer, [[ 2000, 3 ]]);
        timer.pause();
        tickAndAssertSignalValue(timer, [[ 5000, 3 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, 500, (timer) => {
        tickAndAssertSignalValue(timer, [[ 2000, 3 ]]);
        timer.pause();
        tickAndAssertSignalValue(timer, [[ 5000, 3 ]]);
        timer.resume();
        tickAndAssertSignalValue(timer, [[ 500, 4 ]]);
      }));
    });
  });
  /** Sets the signal value and calls detect changes. */
  function setSignal<T>(fixture: MockedComponentFixture<unknown, unknown>, target: WritableSignal<T>, value: T): void {
    target.set(value);
    fixture.detectChanges();
  }

  /** sets up the test inside fakeAsync and pauses the timer at the end to avoid error message. */
  function testTimer<T extends TimeSource, U extends TimeSource | undefined>(timerTime: T, intervalTime: U,
    assertion: (timer: TimerSignal, timerTime: T, intervalTime: U) => void): any {

    return fakeAsync(() => {
      const timer = timerSignal(timerTime, intervalTime, { injector });
      assertion(timer, timerTime, intervalTime);
      timer.pause();
    });
  }
  /** It is a pretty common pattern in these tests to tick, and then expect a signal value */
  function tickAndAssertSignalValue<T, U extends Signal<T> >(source: U, pattern: [tickValue: number, expectedValue: T][]): U {
    // instead of having expect in loop, store them all and have one assertion at the end.
    const results: T[] = [];
    for (const [tickValue] of pattern) {
      tick(tickValue);
      results.push(source());
    }
    expect(results).toEqual(pattern.map(x => x[1]));
    return source;
  }
});


