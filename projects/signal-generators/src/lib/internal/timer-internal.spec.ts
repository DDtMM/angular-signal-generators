import { fakeAsync, tick } from '@angular/core/testing';
import { tickAndAssertValues } from '../../testing/testing-utilities';
import { TimerInternal, TimerInternalOptions, TimerStatus } from './timer-internal';

describe('timerInternal', () => {
  it('should create an instance', () => {
    expect(TimerInternal).toBeTruthy();
  });
  describe('as a timer', () => {
    it(
      'emits once after specified time and sets status as stopped.',
      testTimer(1000, undefined, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [
          [0, 0],
          [1000, 1],
          [2000, 1]
        ]);
        expect(timer.timerStatus === TimerStatus.Stopped);
      })
    );
    it(
      '#get timerTime should return current timeout Timer',
      testTimer(1000, undefined, { runAtStart: true }, (timer) => {
        expect(timer.timeoutTime).toBe(1000);
      })
    );
    it(
      'should increase due time when setting timeoutTime with a higher value',
      testTimer(1000, undefined, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [[500, 0]]);
        timer.timeoutTime = 2000;
        tickAndAssertTimerValue(timer, [
          [500, 0],
          [1000, 1]
        ]);
      })
    );

    it(
      'should decrease due time when setting timeoutTime with a lower value',
      testTimer(1000, undefined, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [[500, 0]]);
        timer.timeoutTime = 750;
        tickAndAssertTimerValue(timer, [[250, 1]]);
      })
    );

    it(
      'throws when accessing intervalTime',
      testTimer(1000, undefined, {}, (timer) => {
        expect(() => (timer.intervalTime = 50)).toThrowError();
        expect(() => timer.intervalTime).toThrowError();
      })
    );

    it(
      '#start restarts when status is Running',
      testTimer(1000, undefined, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [[500, 0]]);
        timer.start();
        tickAndAssertTimerValue(timer, [
          [0, 0],
          [1000, 1]
        ]);
      })
    );

    it(
      '#start starts a when status is Stopped',
      testTimer(1000, undefined, {}, (timer) => {
        timer.start();
        tickAndAssertTimerValue(timer, [
          [0, 0],
          [1000, 1]
        ]);
      })
    );
  });

  describe('as an interval', () => {
    it(
      'emits continuously after timeoutTime is complete',
      testTimer(1000, 500, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [
          [0, 0],
          [1000, 1],
          [500, 2],
          [500, 3]
        ]);
      })
    );

    it('discards missed ticks and schedules the next clock-aligned tick by default', fakeAsync(() => {
      const actualNow = Date.now.bind(Date);
      let clockOffset = 0;
      const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => actualNow() + clockOffset);
      const timer = new TimerInternal(1000, 500, { runAtStart: true });

      clockOffset = 10 * 60 * 1000;
      tick(1000);
      expect(timer.ticks).toBe(1);

      tick(499);
      expect(timer.ticks).toBe(1);
      tick(1);
      expect(timer.ticks).toBe(2);
      timer.destroy();
      nowSpy.mockRestore();
    }));

    it('coalesces missed ticks into one callback with a logical tick count', fakeAsync(() => {
      const actualNow = Date.now.bind(Date);
      let clockOffset = 0;
      const callbackSpy = vi.fn().mockName('callback');
      const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => actualNow() + clockOffset);
      const timer = new TimerInternal(1000, 500, {
        runAtStart: true,
        missedTickBehavior: 'coalesce',
        onTick: callbackSpy
      });

      clockOffset = 10 * 60 * 1000;
      tick(1000);
      expect(timer.ticks).toBe(1201);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).toHaveBeenCalledWith(1201);

      tick(500);
      expect(timer.ticks).toBe(1202);
      timer.destroy();
      nowSpy.mockRestore();
    }));

    it('reschedules a callback that fires before its target time', fakeAsync(() => {
      const actualNow = Date.now.bind(Date);
      let clockOffset = 0;
      const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => actualNow() + clockOffset);
      const timer = new TimerInternal(1000, undefined, { runAtStart: true });

      clockOffset = -1;
      tick(1000);
      expect(timer.ticks).toBe(0);

      clockOffset = 0;
      tick(1);
      expect(timer.ticks).toBe(1);

      timer.destroy();
      nowSpy.mockRestore();
    }));

    it(
      '#get intervalTime returns current intervalTime',
      testTimer(1000, 500, { runAtStart: true }, (timer) => {
        expect(timer.intervalTime).toBe(500);
      })
    );

    it(
      'should increase due time when setting intervalTime with a higher value',
      testTimer(1000, 500, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [[2100, 3]]);
        timer.intervalTime = 1000;
        tickAndAssertTimerValue(timer, [
          [399, 3],
          [1, 4],
          [1000, 5]
        ]);
      })
    );

    it(
      'should decrease due time when setting intervalTime with a lower value',
      testTimer(1000, 500, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [[2100, 3]]);
        timer.intervalTime = 250;
        tickAndAssertTimerValue(timer, [
          [399, 3],
          [1, 4],
          [250, 5]
        ]);
      })
    );

    it('clamps a negative interval duration to zero', () => {
      const timer = new TimerInternal(1000, -1);
      expect(timer.intervalTime).toBe(0);
      timer.intervalTime = -100;
      expect(timer.intervalTime).toBe(0);
      timer.destroy();
    });

    it(
      '#start restarts when status is Running',
      testTimer(1000, 500, { runAtStart: true }, (timer) => {
        tickAndAssertTimerValue(timer, [[2000, 3]]);
        timer.start();
        tickAndAssertTimerValue(timer, [
          [0, 0],
          [2000, 3]
        ]);
      })
    );

    it(
      '#start starts when status is Stopped',
      testTimer(1000, 500, {}, (timer) => {
        timer.start();
        tickAndAssertTimerValue(timer, [
          [0, 0],
          [2000, 3]
        ]);
      })
    );
  });

  it(
    '#destroy sets status as Destroyed and prevents ticks',
    testTimer(1000, undefined, { runAtStart: true }, (timer) => {
      timer.destroy();
      expect(timer.timerStatus).toBe(TimerStatus.Destroyed);
      tickAndAssertTimerValue(timer, [[1000, 0]]);
    })
  );
  it(
    '#pause prevents emissions over time',
    testTimer(1000, 500, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[2250, 3]]);
      timer.pause();
      tickAndAssertTimerValue(timer, [[1000, 3]]);
    })
  );
  it(
    '#resume continues emissions',
    testTimer(1000, 500, { runAtStart: true }, (timer) => {
      tickAndAssertTimerValue(timer, [[2250, 3]]);
      timer.pause();
      tickAndAssertTimerValue(timer, [[1000, 3]]);
      timer.resume();
      tickAndAssertTimerValue(timer, [[750, 5]]);
    })
  );
  it('calls callback after each tick', fakeAsync(() => {
    const callbackSpy = vi.fn((x: number) => x).mockName('callback');
    const timer = new TimerInternal(1000, 500, { runAtStart: true, onTick: callbackSpy });
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
    assertion: (timer: TimerInternal, timerTime: number, intervalTime: number | undefined) => void
  ): () => void {
    return fakeAsync(() => {
      const timer = new TimerInternal(timerTime, intervalTime, options);
      assertion(timer, timerTime, intervalTime);
      timer.destroy();
    });
  }

  /** It is a pretty common pattern in these tests to tick, and then expect a value */
  function tickAndAssertTimerValue(timer: TimerInternal, pattern: [elapsedMs: number, expectedTicks: number][]): void {
    tickAndAssertValues(() => timer.ticks, pattern);
  }
});
