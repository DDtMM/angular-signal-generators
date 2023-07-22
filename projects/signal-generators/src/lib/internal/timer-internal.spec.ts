import { fakeAsync, tick } from '@angular/core/testing';
import { TimerInternal, TimerInternalOptions, TimerStatus } from './timer-internal';
import { tickAndAssertValue } from '../../testing/testing-utilities';

describe('timerInternal', () => {
  it('should create an instance', () => {
    expect(TimerInternal).toBeTruthy();
  });
  describe('as a timer', () => {
    it('emits once after specified time and sets status as stopped.', testTimer(1000, undefined, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
      expect(timer.timerStatus === TimerStatus.Stopped);
    }));

    it('should increase due time when setting timeoutTime with a higher value', testTimer(1000, undefined, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[ 500, 0 ]]);
      timer.timeoutTime = 2000;
      tickAndAssertTimerValue(timer, [[ 500, 0 ], [1000, 1]]);
    }));

    it('should decrease due time when setting timeoutTime with a lower value', testTimer(1000, undefined, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[ 500, 0 ]]);
      timer.timeoutTime = 750;
      tickAndAssertTimerValue(timer, [[ 250, 1 ]]);
    }));

    it('throws when accessing intervalTime', testTimer(1000, undefined, { }, (timer) => {
      expect(() => timer.intervalTime = 50).toThrowError();
      expect(() => timer.intervalTime).toThrowError();
    }));

    it('#start restarts when status is Running', testTimer(1000, undefined, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[ 500, 0 ]]);
      timer.start();
      tickAndAssertTimerValue(timer, [[0, 0], [ 1000, 1 ]]);
    }));

    it('#start starts a when status is Stopped', testTimer(1000, undefined, { }, (timer) => {
      timer.start();
      tickAndAssertTimerValue(timer, [[0, 0], [ 1000, 1 ]]);
    }));
  });

  describe('as an interval', () => {
    it('emits continuously after timeoutTime is complete', testTimer(1000, 500, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
    }));

    it('should increase due time when setting intervalTime with a higher value', testTimer(1000, 500, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[ 2100, 3 ]]);
      timer.intervalTime = 1000;
      tickAndAssertTimerValue(timer, [[ 400, 3 ], [500, 4], [1000, 5]]);
    }));

    it('should decrease due time when setting intervalTime with a lower value', testTimer(1000, 500, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[ 2100, 3 ]]);
      timer.intervalTime = 250;
      tickAndAssertTimerValue(timer, [[ 150, 4 ], [250, 5]]);
    }));

    it('#start restarts when status is Running', testTimer(1000, 500, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[ 2000, 3 ]]);
      timer.start();
      tickAndAssertTimerValue(timer, [[0, 0], [ 2000, 3 ]]);
    }));

    it('#start starts when status is Stopped', testTimer(1000, 500, { }, (timer) => {
      timer.start();
      tickAndAssertTimerValue(timer, [[0, 0], [ 2000, 3 ]]);
    }));
  });

  it('#destroy sets status as Destroyed and prevents ticks', testTimer(1000, undefined, { runAtStart: true }, (timer) => {
    timer.destroy();
    expect(timer.timerStatus).toBe(TimerStatus.Destroyed);
    tickAndAssertTimerValue(timer, [[ 1000, 0 ]]);
  }));
  it('#pause prevents emissions over time', testTimer(1000, 500, { runAtStart: true }, (timer) => {
    tickAndAssertTimerValue(timer, [[ 2250, 3 ]]);
    timer.pause()
    tickAndAssertTimerValue(timer, [[ 1000, 3 ]]);
  }));
  it('#resume continues emissions', testTimer(1000, 500, { runAtStart: true }, (timer) => {
    tickAndAssertTimerValue(timer, [[ 2250, 3 ]]);
    timer.pause();
    tickAndAssertTimerValue(timer, [[ 1000, 3 ]]);
    timer.resume();
    tickAndAssertTimerValue(timer, [[ 750, 5 ]]);
  }));
  it('calls callback after each tick', fakeAsync(() => {
    const callbackSpy = jasmine.createSpy('callback', (_: number) => {});
    const timer = new TimerInternal(1000, 500, { runAtStart: true , callback: callbackSpy });
    tick(3000);
    expect(callbackSpy).toHaveBeenCalledTimes(5);
    expect(callbackSpy).toHaveBeenCalledWith(5);
    timer.destroy();
  }));
  /** sets up the test inside fakeAsync and pauses the timer at the end to avoid error message. */
  function testTimer<N extends number>(
    timerTime: N,
    intervalTime: N | undefined,
    options: TimerInternalOptions | undefined,
    assertion: (timer: TimerInternal, timerTime: number, intervalTime: number | undefined) => void): any {

    return fakeAsync(() => {
      const timer = new TimerInternal(timerTime, intervalTime, options);
      assertion(timer, timerTime, intervalTime);
      timer.destroy();
    });
  }

  /** It is a pretty common pattern in these tests to tick, and then expect a value */
  function tickAndAssertTimerValue(timer: TimerInternal, pattern: [elapsedMs: number, expectedTicks: number][]): void {
    tickAndAssertValue(() => timer.ticks, pattern);
  }
});

