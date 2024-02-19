import { Injector, signal } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { tickAndAssertValues } from '../../testing/testing-utilities';
import { tweenSignal } from './tween-signal';

describe('tweenSignal', () => {

  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  setupTypeGuardTests(() => tweenSignal(1, { injector }));

  describe('when passed a value', () => {
    setupComputedAndEffectTests(() => {
      const sut = tweenSignal(1, { injector,  duration: 500 });
      return [sut, () => { sut.set(2); fixture.detectChanges(); tick(500); }];
    });

    it('initially returns the initial value', fakeAsync(() => {
      const sut = tweenSignal(5, { injector });
      expect(sut()).toBe(5);
    }));

    it('cleans up when destroyed', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 3]]);
      fixture.destroy();
      tickAndAssertValues(() => Math.round(sut()), [[250, 3]]);
    }));

    it('returns an in between value when in between duration', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 3], [250, 5]]);
    }));

    it('updates value when update is used', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(5, { injector, duration: 500 }));
      sut.update((x) => x + 4, { duration: 1000 });
      tickAndAssertValues(() => Math.round(sut()), [[0, 5], [500, 7], [500, 9]]);
    }));

    it('returns a delayed value when delay is passed', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, delay: 500, duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [500, 1], [250, 3], [250, 5]]);
    }));

    it('returns an eased value when easing is passed as a EasingName', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, easing: 'easeOutQuart', duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
    }));

    it('returns an eased value when easing is passed as a function', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, easing: (x) =>  1 - Math.pow(1 - x, 4), duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
    }));

    it('returns a interpolated value when interpolator is passed', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(1, {
        injector,
        interpolator: (a, b) => (p) => (a * (1 - p)) + (b * p) + 1,
        duration: 500 }));
      sut.set(5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 4], [250, 6]]);
    }));

    it('cancels a previous previously running tween', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal(5, { injector, duration: 500 }));
      sut.set(-5);
      tickAndAssertValues(() => Math.round(sut()), [[0, 5], [250, 0]]);
      sut.set(8);
      tickAndAssertValues(() => Math.round(sut()), [[0, 0], [250, 4], [250, 8]]);
    }));

    describe('and overriding defaults', () => {
      it('returns an in between value when in between duration', fakeAsync(() => {
        const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, duration: 100 }));
        sut.set(5, { duration: 1000 });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [500, 3], [500, 5]]);
      }));
      it('returns a delayed value when delay is passed', fakeAsync(() => {
        const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, delay: 500, duration: 500 }));
        sut.set(5, { delay: 1000 });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [1000, 1], [250, 3], [250, 5]]);
      }));
      it('returns an eased value when easing is passed as a EasingName', fakeAsync(() => {
        const sut = autoDetectChangesSignal(fixture, tweenSignal(1, { injector, duration: 500 }));
        sut.set(5, { easing: 'easeOutQuart' });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
      }));
      it('returns a interpolated value when interpolator is passed', fakeAsync(() => {
        const sut = autoDetectChangesSignal(fixture, tweenSignal(1, {
          injector,
          interpolator: (a, b) => (p) => (a * (1 - p)) + (b * p) + 1,
          duration: 500 }));
        sut.set(5, { interpolator: (a, b) => (p) => (a * (1 - p)) + (b * p) + 2 });
        tickAndAssertValues(() => Math.round(sut()), [[0, 1], [250, 5], [250, 7]]);
      }));
    });
  });

  describe('when passed a number array', () => {
    it('returns tweened values', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal([0, 10], { injector, duration: 500 }));
      sut.set([10, -10]);
      tickAndAssertValues(() => [Math.round(sut()[0]), Math.round(sut()[1])], [[0, [0, 10]], [250, [5, 0]], [250, [10, -10]]]);
    }));

    it('returns the end value if there are not enough elements in to tween from in the original array', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal([0], { injector, duration: 500 }));
      sut.set([10, -10]);
      tickAndAssertValues(() => [Math.round(sut()[0]), Math.round(sut()[1])], [[0, [0, NaN]], [250, [5, -10]], [250, [10, -10]]]);
    }));
  });

  describe('when passed a number record', () => {
    it('returns tweened values', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal({ x: 0, y: 10 }, { injector, duration: 500 }));
      sut.set({x: 10, y: -10});
      tickAndAssertValues(() => ({ x: Math.round(sut().x), y: Math.round(sut().y) }),
        [[0, { x: 0, y: 10 }], [250, { x: 5, y: 0 }], [250, { x: 10, y: -10 }]]);
    }));

    it('returns the end value if there are not a matching property to tween from in the original array', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, tweenSignal<Record<string, number>>({ x: 0 }, { injector, duration: 500 }));
      sut.set({x: 10, y: -10});
      tickAndAssertValues(() => ({ x: Math.round(sut()['x']), y: Math.round(sut()['y']) }),
        [[0, { x: 0, y: NaN }], [250, { x: 5, y: -10 }], [250, { x: 10, y: -10 }]]);
    }));
  });

  describe('when passed a signal', () => {
    setupComputedAndEffectTests(() => {
      const source = signal(1);
      const sut = tweenSignal(source, { injector,  duration: 500 });
      return [sut, () => { source.set(2); fixture.detectChanges(); tick(500); }];
    });

    it('returns tweened values', fakeAsync(() => {
      const source = autoDetectChangesSignal(fixture, signal(5));
      const sut = autoDetectChangesSignal(fixture, tweenSignal(source, { injector, duration: 500 }));
      source.set(9);
      tickAndAssertValues(() => Math.round(sut()), [[0, 5], [250, 7], [250, 9]]);
    }));
  })

});
