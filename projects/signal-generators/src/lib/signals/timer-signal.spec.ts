import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockBuilder, MockInstance } from 'ng-mocks';
import { runComputedAndEffectTests, runDebugNameOptionTest, runInjectorOptionTest, runTypeGuardTests } from '../../testing/common-signal-tests';
import { createFixture, tickAndAssertValues } from '../../testing/testing-utilities';
import { ValueSource } from '../value-source';
import { TimerSignal, timerSignal } from './timer-signal';

describe('timerSignal', () => {
  let fixture: ComponentFixture<unknown>;

  beforeEach(() => fixture = createFixture());

  runDebugNameOptionTest((debugName) => timerSignal(500, undefined, { debugName }));
  runInjectorOptionTest((injector) => timerSignal(500, undefined, { injector }));
  runTypeGuardTests(() => timerSignal(500, undefined));

  it('should use injector when not passed as a parameter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const sut = timerSignal(500, 500);
      tickAndAssertValues(() => sut(), [[0, 0], [ 500, 1 ], [ 500, 2 ]]);
      sut.pause();
    });
  }));
  describe('as a timer', () => {

    it('emits once after specified time.', testTimer(100, undefined, (sut) => {
      tickAndAssertValues(() => sut(), [[0, 0], [ 1000, 1 ], [ 2000, 1 ]]);
    }));

    it('is not running if stopped option is true', () => {
      const sut = timerSignal(500, null, { stopped: true, injector: fixture.componentRef.injector });
      expect(sut.state()).toBe('stopped');
    });

    it('reflects correct state after action', () => {
      const sut = timerSignal(500, null, { stopped: true, injector: fixture.componentRef.injector });
      expect(sut.state()).toBe('stopped');
      sut.restart();
      expect(sut.state()).toBe('running');
      sut.pause();
      expect(sut.state()).toBe('paused');
      sut.resume();
      expect(sut.state()).toBe('running');
      sut.pause();
      sut.restart();
      expect(sut.state()).toBe('running');
      fixture.componentRef.destroy();
      expect(sut.state()).toBe('destroyed');
    });

    describe('with selector option', () => {
      it('should emit string values using selector', fakeAsync(() => {
        const sut = timerSignal(500, undefined, { selector: (tick) => `tick-${tick}`, injector: fixture.componentRef.injector });
        tickAndAssertValues(() => sut(), [[0, 'tick-0'], [500, 'tick-1'], [500, 'tick-1']]);
        sut.pause();
      }));

      it('should emit string values for interval using selector', fakeAsync(() => {
        const sut = timerSignal(500, 500, { selector: (tick) => `tick-${tick}`, injector: fixture.componentRef.injector });
        tickAndAssertValues(() => sut(), [[0, 'tick-0'], [500, 'tick-1'], [500, 'tick-2'], [500, 'tick-3']]);
        sut.pause();
      }));
    });

    describe('with a number for timerSource parameter', () => {
      runComputedAndEffectTests(() => {
        const sut = timerSignal(500, null, { injector: fixture.componentRef.injector });
        return [sut, () => { tick(500); }];
      });

      it('sets a sut for the timerSource amount', testTimer(100, undefined, (sut) => {
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ]]);
      }));
    });


    describe('with a signal for timerSource parameter', () => {
      runComputedAndEffectTests(() => {
        const sut = timerSignal(signal(500), null, { injector: fixture.componentRef.injector });
        return [sut, () => { tick(500); sut.pause(); }];
      });


      it('sets a sut for the timerSource amount', testTimer(signal(1000), undefined, (sut) => {
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ]]);
      }));

      it('increases due time if signal increases', testTimer(signal(1000), undefined, (sut, timerDurationSignal) => {
        tickAndAssertValues(sut, [[ 500, 0 ]]);
        timerDurationSignal.set(1500);
        fixture.detectChanges();
        tickAndAssertValues(sut, [[ 500, 0 ], [ 500, 1 ]]);
      }));

      it('decreases due time if signal decreases', testTimer(signal(1000), undefined, (sut, timerDurationSignal) => {
        tickAndAssertValues(sut, [[ 500, 0 ]]);
        timerDurationSignal.set(500);
        fixture.detectChanges();
        tickAndAssertValues(sut, [[ 1, 1 ]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value', testTimer(1000, undefined, (sut) => {
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ]]);
        sut.restart();
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ]]);
      }));

      it('interrupts an existing sut.', testTimer(1000, undefined, (sut) => {
        tickAndAssertValues(sut, [[0, 0], [ 500, 0 ]]);
        sut.restart();
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ]]);
      }));
    });

    describe('pause and resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, undefined, (sut) => {
        tickAndAssertValues(sut, [[ 500, 0 ]]);
        sut.pause();
        tickAndAssertValues(sut, [[ 5000, 0 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, undefined, (sut) => {
        tickAndAssertValues(sut, [[ 999, 0 ]]);
        sut.pause();
        tickAndAssertValues(sut, [[ 5000, 0 ]]);
        sut.resume();
        tickAndAssertValues(sut, [[ 1, 1 ]]);
      }));
    });
  });

  describe('as an interval', () => {
    it('emits continuously after timerTime is complete', testTimer(1000, 500, (sut) => {
      tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
    }));

    describe('with a number for intervalSource parameter', () => {
      runComputedAndEffectTests(() => {
        const sut = timerSignal(500, 500, { injector: fixture.componentRef.injector });
        return [sut, () => { tick(2000); sut.pause(); }];
      });

      it('sets an interval for the intervalSource amount', testTimer(1000, 500, (sut) => {
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));
    });

    describe('with a signal for intervalSource parameter', () => {
      runComputedAndEffectTests(() => {
        const sut = timerSignal(500, signal(500), { injector: fixture.componentRef.injector });
        return [sut, () => { tick(2000); sut.pause(); }];
      });


      it('sets a sut for the timerSource amount', testTimer(1000, signal(500), (sut) => {
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ], [ 500, 2 ], [ 500, 3 ]]);
      }));


      it('increases due time if signal increases', testTimer(1000, signal(500), (sut, _, intervalDurationSignal) => {
        tickAndAssertValues(sut, [[ 1750, 2]]);
        intervalDurationSignal.set(750);
        fixture.detectChanges();
        tickAndAssertValues(sut, [[ 500, 3 ], [ 750, 4 ], [750, 5]]);
      }));

      it('decreases due time if signal decreases', testTimer(1000, signal(500), (sut, _, intervalDurationSignal) => {
        tickAndAssertValues(sut, [[ 1750, 2]]);
        intervalDurationSignal.set(250);
        fixture.detectChanges();
        tickAndAssertValues(sut, [[ 0, 3 ], [ 250, 4 ], [250, 5]]);
      }));
    });

    describe('#restart', () => {
      it('resets signal value and begins from initial sut', testTimer(1000, 500, (sut) => {
        tickAndAssertValues(sut, [[ 1750, 2]]);
        sut.restart();
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));

      it('interrupts an existing interval.', testTimer(1000, 500, (sut) => {
        tickAndAssertValues(sut, [[ 1750, 2]]);
        sut.restart();
        tickAndAssertValues(sut, [[0, 0], [ 1000, 1 ], [500, 2]]);
      }));
    });
    describe('#pause and #resume', () => {
      it('#pause prevents emissions over time', testTimer(1000, 500, (sut) => {
        tickAndAssertValues(sut, [[ 2000, 3 ]]);
        sut.pause();
        tickAndAssertValues(sut, [[ 5000, 3 ]]);
      }));

      it('#resume continues emissions', testTimer(1000, 500, (sut) => {
        tickAndAssertValues(sut, [[ 2000, 3 ]]);
        sut.pause();
        tickAndAssertValues(sut, [[ 5000, 3 ]]);
        sut.resume();
        tickAndAssertValues(sut, [[ 500, 4 ]]);
      }));
    });
  });


  /** sets up the test inside fakeAsync and pauses the sut at the end to avoid error message. */
  function testTimer<T extends ValueSource<number>, U extends ValueSource<number> | undefined>(timerTime: T, intervalTime: U,
    assertion: (sut: TimerSignal, timerTime: T, intervalTime: U) => void): jasmine.ImplementationCallback {

    return fakeAsync(() => {
      const sut = timerSignal(timerTime, intervalTime, { injector: fixture.componentRef.injector });
      assertion(sut, timerTime, intervalTime);
      sut.pause();
    });
  }
});

/** Environment tests have slightly different setups. */
describe('timerSignal', () => {
  beforeEach(() => MockBuilder().mock(PLATFORM_ID));
  MockInstance.scope();
  it('should start running after creation when platform is browser', fakeAsync(() => {
    MockInstance(PLATFORM_ID, () => 'browser');
    const fixture = createFixture();
    const sut = timerSignal(500, null, { injector: fixture.componentRef.injector });
    expect(sut.state()).toBe('running');
    tickAndAssertValues(sut, [[ 500, 1 ]]);
  }));

  it('should be stopped after creation when platform is not browser', fakeAsync(() => {
    MockInstance(PLATFORM_ID, () => 'not browser');
    const fixture = createFixture();
    const sut = timerSignal(500, null, { injector: fixture.componentRef.injector });
    expect(sut.state()).toBe('stopped');
    tickAndAssertValues(sut, [[ 500, 0 ]]);
  }));
});
