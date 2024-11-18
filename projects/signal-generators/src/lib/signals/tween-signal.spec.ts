import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { easeOutQuart } from '../../../easings/src/easings';
import { runComputedAndEffectTests, runDebugNameOptionTest, runInjectorOptionTest, runTypeGuardTests } from '../../testing/common-signal-tests';
import { createFixture, tickAndAssertValues } from '../../testing/testing-utilities';
import { tweenSignal } from './tween-signal';

describe('tweenSignal', () => {

  describe('when passed a value', () => {

    runDebugNameOptionTest((debugName) => tweenSignal(1, { debugName, duration: 0 }));
    runInjectorOptionTest((injector) => tweenSignal(1, { injector, duration: 0 }));
    runTypeGuardTests(() => tweenSignal(1));

    runComputedAndEffectTests(() => {
      const sut = tweenSignal(1, { duration: 500 });
      return [sut, () => { sut.set(2); tick(500); }];
    });

    it('initially returns the initial value', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(5));
      expect(sut()).toBe(5);
    }));

    it('cleans up when destroyed', fakeAsync(() => {
      const fixture = createFixture();
      const sut = tweenSignal(1, { injector: fixture.componentRef.injector, duration: 500 });
      sut.set(5);
      fixture.detectChanges();
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 3]]);
      fixture.destroy();
      tickAndAssertValues(() => Math.round(sut()), [[250, 3]]);
    }));

    it('returns an in between value when in between duration', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 3], [250, 5]]);
    }));

    it('updates value when update is used', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(5, { duration: 500 }));
      sut.update((x) => x + 4, { duration: 1000 });
      tickAndAssertValues(() => Math.round(sut()), [[0, 5], [500, 7], [500, 9]]);
    }));

    it('returns a delayed value when delay is passed', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { delay: 500, duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [500, 1], [250, 3], [250, 5]]);
    }));

    it('returns an eased value when easing is passed as a function', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { easing: easeOutQuart, duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
    }));

    it('returns an interpolated value when interpolator is passed', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(1, {
        interpolator: (a, b) => (p) => (a * (1 - p)) + (b * p) + 1,
        duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 4], [250, 6]]);
    }));

    it('cancels a previous previously running tween', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal(5, { duration: 500 }));
      sut.set(-5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 5], [250, 0]]);
      sut.set(8);
      tickAndAssertValues(() => Math.round(sut()), [[0, 0], [250, 4], [250, 8]]);
    }));

    describe('and using set options to change default animation parameters', () => {
      it('returns an in between value when in between duration', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 100 }));
        sut.setOptions({ duration: 1000 });
        sut.set(5);
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [500, 3], [500, 5]]);
      }));
      it('returns a delayed value when delay is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { delay: 500, duration: 500 }));
        sut.setOptions({ delay: 1000 });
        sut.set(5);
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [1000, 1], [250, 3], [250, 5]]);
      }));
      it('returns an eased value when easing is passed as a function', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
        sut.setOptions({ easing: easeOutQuart });
        sut.set(5);
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
      }));
      it('returns a interpolated value when interpolator is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
        sut.setOptions({ interpolator: (a, b) => (p) => (a * (1 - p)) + (b * p) + 2 });
        sut.set(5);
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 5], [250, 7]]);
      }));
    });

    describe('and overriding defaults when setting a value', () => {
      it('returns an in between value when in between duration', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 100 }));
        sut.set(5, { duration: 1000 });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [500, 3], [500, 5]]);
      }));
      it('returns a delayed value when delay is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { delay: 500, duration: 500 }));
        sut.set(5, { delay: 1000 });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [1000, 1], [250, 3], [250, 5]]);
      }));
      it('returns an eased value when easing is passed as a function', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
        sut.set(5, { easing: easeOutQuart });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
      }));
      it('returns a interpolated value when interpolator is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
        sut.set(5, { interpolator: (a, b) => (p) => (a * (1 - p)) + (b * p) + 2 });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 5], [250, 7]]);
      }));
    });
  });

  describe('when passed a number array', () => {
    it('returns tweened values', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal([0, 10], { duration: 500 }));
      sut.set([10, -10]);
      tickAndAssertValues(() => [Math.round(sut()[0]), Math.round(sut()[1])], [[0, [0, 10]], [250, [5, 0]], [250, [10, -10]]]);
    }));

    it('returns the end value if there are not enough elements in to tween from in the original array', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal([0], { duration: 500 }));
      sut.set([10, -10]);
      tickAndAssertValues(() => [Math.round(sut()[0]), Math.round(sut()[1])], [[0, [0, NaN]], [250, [5, -10]], [250, [10, -10]]]);
    }));
  });

  describe('when passed a number record', () => {
    it('returns tweened values', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal({ x: 0, y: 10 }, { duration: 500 }));
      sut.set({x: 10, y: -10});
      tickAndAssertValues(() => ({ x: Math.round(sut().x), y: Math.round(sut().y) }),
        [[0, { x: 0, y: 10 }], [250, { x: 5, y: 0 }], [250, { x: 10, y: -10 }]]);
    }));

    it('returns the end value if there are not a matching property to tween from in the original array', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => tweenSignal<Record<string, number>>({ x: 0 }, { duration: 500 }));
      sut.set({x: 10, y: -10});
      tickAndAssertValues(() => ({ x: Math.round(sut()['x']), y: Math.round(sut()['y']) }),
        [[0, { x: 0, y: NaN }], [250, { x: 5, y: -10 }], [250, { x: 10, y: -10 }]]);
    }));
  });

  describe('when passed a signal', () => {
    runDebugNameOptionTest((debugName) => tweenSignal(signal(1), { debugName, duration: 0 }));
    runInjectorOptionTest((injector) => tweenSignal(signal(1), { injector, duration: 0 }));
    runTypeGuardTests(() => tweenSignal(signal(1)));

    runComputedAndEffectTests(() => {
      const source = signal(1);
      const sut = tweenSignal(source, { duration: 500 });
      return [sut, () => { source.set(2); tick(500); }];
    });

    it('returns tweened values', fakeAsync(() => {
      const source = signal(5);
      const sut = TestBed.runInInjectionContext(() => tweenSignal(source, { duration: 500 }));
      source.set(9);
      tickAndAssertValues(() => Math.round(sut()), [[0, 5], [250, 7], [250, 9]]);
    }));
  })

});
