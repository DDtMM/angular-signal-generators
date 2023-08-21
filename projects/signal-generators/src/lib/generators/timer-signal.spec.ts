import { Injector, signal } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { tickAndAssertValue } from '../../testing/testing-utilities';
import { TimerSignal, timerSignal } from './timer-signal';
import { ValueSource } from '../value-source';
import { setupGeneralSignalTests } from '../../testing/general-signal-tests.spec';

describe('timerSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  setupGeneralSignalTests(() => timerSignal(500, undefined, { injector }));

  describe('as a timer', () => {

    it('emits once after specified time.', testTimer(100, undefined, (timer) => {
      tickAndAssertValue(() => timer(), [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
    }));

    describe('with a number for timerSource parameter', () => {
      it('sets a timer for the timerSource amount', testTimer(100, undefined, (timer) => {
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('with a signal for timerSource parameter', () => {
      it('sets a timer for the timerSource amount', testTimer(signal(1000), undefined, (timer) => {
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('increases due time if signal increases', testTimer(signal(1000), undefined, (timer, timerDurationSignal) => {
        tickAndAssertValue(timer, [[ 500, 0 ]]);
        timerDurationSignal.set(1500);
        fixture.detectChanges();
        tickAndAssertValue(timer, [[ 500, 0 ], [ 500, 1 ]]);
      }));

      it('decreases due time if signal decreases', testTimer(signal(1000), undefined, (timer, timerDurationSignal) => {
        tickAndAssertValue(timer, [[ 500, 0 ]]);
        timerDurationSignal.set(500);
        fixture.detectChanges();
        tickAndAssertValue(timer, [[ 1, 1 ]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value', testTimer(1000, undefined, (timer) => {
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ]]);
        timer.restart();
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));

      it('interrupts an existing timer.', testTimer(1000, undefined, (timer) => {
        tickAndAssertValue(timer, [[0, 0], [ 500, 0 ]]);
        timer.restart();
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('pause and resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, undefined, (timer) => {
        tickAndAssertValue(timer, [[ 500, 0 ]]);
        timer.pause();
        tickAndAssertValue(timer, [[ 5000, 0 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, undefined, (timer) => {
        tickAndAssertValue(timer, [[ 999, 0 ]]);
        timer.pause();
        tickAndAssertValue(timer, [[ 5000, 0 ]]);
        timer.resume();
        tickAndAssertValue(timer, [[ 1, 1 ]]);
      }));
    });
  });

  describe('as an interval', () => {
    it('emits continuously after timerTime is complete', testTimer(1000, 500, (timer) => {
      tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
    }));

    describe('with a number for intervalSource parameter', () => {
      it('sets an interval for the intervalSource amount', testTimer(1000, 500, (timer) => {
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));
    });

    describe('with a signal for intervalSource parameter', () => {
      it('sets a timer for the timerSource amount', testTimer(1000, signal(500), (timer) => {
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));


      it('increases due time if signal increases', testTimer(1000, signal(500), (timer, _, intervalDurationSignal) => {
        tickAndAssertValue(timer, [[ 1750, 2]]);
        intervalDurationSignal.set(750);
        fixture.detectChanges();
        tickAndAssertValue(timer, [[ 500, 3 ], [ 750, 4 ], [750, 5]]);
      }));

      it('decreases due time if signal decreases', testTimer(1000, signal(500), (timer, _, intervalDurationSignal) => {
        tickAndAssertValue(timer, [[ 1750, 2]]);
        intervalDurationSignal.set(250);
        fixture.detectChanges();
        tickAndAssertValue(timer, [[ 0, 3 ], [ 250, 4 ], [250, 5]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value and begins from initial timer', testTimer(1000, 500, (timer) => {
        tickAndAssertValue(timer, [[ 1750, 2]]);
        timer.restart();
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));

      it('interrupts an existing interval.', testTimer(1000, 500, (timer) => {
        tickAndAssertValue(timer, [[ 1750, 2]]);
        timer.restart();
        tickAndAssertValue(timer, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));
    });
    describe('#pause and #resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, 500, (timer) => {
        tickAndAssertValue(timer, [[ 2000, 3 ]]);
        timer.pause();
        tickAndAssertValue(timer, [[ 5000, 3 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, 500, (timer) => {
        tickAndAssertValue(timer, [[ 2000, 3 ]]);
        timer.pause();
        tickAndAssertValue(timer, [[ 5000, 3 ]]);
        timer.resume();
        tickAndAssertValue(timer, [[ 500, 4 ]]);
      }));
    });
  });


  /** sets up the test inside fakeAsync and pauses the timer at the end to avoid error message. */
  function testTimer<T extends ValueSource<number>, U extends ValueSource<number> | undefined>(timerTime: T, intervalTime: U,
    assertion: (timer: TimerSignal, timerTime: T, intervalTime: U) => void): jasmine.ImplementationCallback {

    return fakeAsync(() => {
      const timer = timerSignal(timerTime, intervalTime, { injector });
      assertion(timer, timerTime, intervalTime);
      timer.pause();
    });
  }

});


