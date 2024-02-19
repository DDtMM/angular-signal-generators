import { signal } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { tickAndAssertValues } from '../../testing/testing-utilities';
import { ValueSource } from '../value-source';
import { TimerSignal, timerSignal } from './timer-signal';

describe('timerSignal', () => {
  let fixture: MockedComponentFixture<void, void>;

  beforeEach(() => fixture = MockRender());

  setupTypeGuardTests(() => timerSignal(500, undefined, { injector: fixture.componentRef.injector }));

  describe('as a timer', () => {

    it('emits once after specified time.', testTimer(100, undefined, (timer) => {
      tickAndAssertValues(() => timer(), [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
    }));

    describe('with a number for timerSource parameter', () => {
      setupComputedAndEffectTests(() => {
        const sut = timerSignal(500, null, { injector: fixture.componentRef.injector });
        return [sut, () => { tick(500); }];
      });

      it('sets a timer for the timerSource amount', testTimer(100, undefined, (timer) => {
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('with a signal for timerSource parameter', () => {
      setupComputedAndEffectTests(() => {
        const sut = timerSignal(signal(500), null, { injector: fixture.componentRef.injector });
        return [sut, () => { tick(500); sut.pause(); }];
      });


      it('sets a timer for the timerSource amount', testTimer(signal(1000), undefined, (timer) => {
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('increases due time if signal increases', testTimer(signal(1000), undefined, (timer, timerDurationSignal) => {
        tickAndAssertValues(timer, [[ 500, 0 ]]);
        timerDurationSignal.set(1500);
        fixture.detectChanges();
        tickAndAssertValues(timer, [[ 500, 0 ], [ 500, 1 ]]);
      }));

      it('decreases due time if signal decreases', testTimer(signal(1000), undefined, (timer, timerDurationSignal) => {
        tickAndAssertValues(timer, [[ 500, 0 ]]);
        timerDurationSignal.set(500);
        fixture.detectChanges();
        tickAndAssertValues(timer, [[ 1, 1 ]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value', testTimer(1000, undefined, (timer) => {
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ]]);
        timer.restart();
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('interrupts an existing timer.', testTimer(1000, undefined, (timer) => {
        tickAndAssertValues(timer, [[0, 0], [ 500, 0 ]]);
        timer.restart();
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('pause and resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, undefined, (timer) => {
        tickAndAssertValues(timer, [[ 500, 0 ]]);
        timer.pause();
        tickAndAssertValues(timer, [[ 5000, 0 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, undefined, (timer) => {
        tickAndAssertValues(timer, [[ 999, 0 ]]);
        timer.pause();
        tickAndAssertValues(timer, [[ 5000, 0 ]]);
        timer.resume();
        tickAndAssertValues(timer, [[ 1, 1 ]]);
      }));
    });
  });

  describe('as an interval', () => {
    it('emits continuously after timerTime is complete', testTimer(1000, 500, (timer) => {
      tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
    }));

    describe('with a number for intervalSource parameter', () => {
      setupComputedAndEffectTests(() => {
        const sut = timerSignal(500, 500, { injector: fixture.componentRef.injector });
        return [sut, () => { tick(2000); sut.pause(); }];
      });

      it('sets an interval for the intervalSource amount', testTimer(1000, 500, (timer) => {
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));
    });

    describe('with a signal for intervalSource parameter', () => {
      setupComputedAndEffectTests(() => {
        const sut = timerSignal(500, signal(500), { injector: fixture.componentRef.injector });
        return [sut, () => { tick(2000); sut.pause(); }];
      });


      it('sets a timer for the timerSource amount', testTimer(1000, signal(500), (timer) => {
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));


      it('increases due time if signal increases', testTimer(1000, signal(500), (timer, _, intervalDurationSignal) => {
        tickAndAssertValues(timer, [[ 1750, 2]]);
        intervalDurationSignal.set(750);
        fixture.detectChanges();
        tickAndAssertValues(timer, [[ 500, 3 ], [ 750, 4 ], [750, 5]]);
      }));

      it('decreases due time if signal decreases', testTimer(1000, signal(500), (timer, _, intervalDurationSignal) => {
        tickAndAssertValues(timer, [[ 1750, 2]]);
        intervalDurationSignal.set(250);
        fixture.detectChanges();
        tickAndAssertValues(timer, [[ 0, 3 ], [ 250, 4 ], [250, 5]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value and begins from initial timer', testTimer(1000, 500, (timer) => {
        tickAndAssertValues(timer, [[ 1750, 2]]);
        timer.restart();
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));

      it('interrupts an existing interval.', testTimer(1000, 500, (timer) => {
        tickAndAssertValues(timer, [[ 1750, 2]]);
        timer.restart();
        tickAndAssertValues(timer, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));
    });
    describe('#pause and #resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, 500, (timer) => {
        tickAndAssertValues(timer, [[ 2000, 3 ]]);
        timer.pause();
        tickAndAssertValues(timer, [[ 5000, 3 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, 500, (timer) => {
        tickAndAssertValues(timer, [[ 2000, 3 ]]);
        timer.pause();
        tickAndAssertValues(timer, [[ 5000, 3 ]]);
        timer.resume();
        tickAndAssertValues(timer, [[ 500, 4 ]]);
      }));
    });
  });


  /** sets up the test inside fakeAsync and pauses the timer at the end to avoid error message. */
  function testTimer<T extends ValueSource<number>, U extends ValueSource<number> | undefined>(timerTime: T, intervalTime: U,
    assertion: (timer: TimerSignal, timerTime: T, intervalTime: U) => void): jasmine.ImplementationCallback {

    return fakeAsync(() => {
      const timer = timerSignal(timerTime, intervalTime, { injector: fixture.componentRef.injector });
      assertion(timer, timerTime, intervalTime);
      timer.pause();
    });
  }
});
