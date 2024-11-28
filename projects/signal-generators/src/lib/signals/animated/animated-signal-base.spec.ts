import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import {
  runComputedAndEffectTests,
  runDebugNameOptionTest,
  runInjectorOptionTest,
  runTypeGuardTests
} from '../../../testing/common-signal-tests';
import { createFixture, tickAndAssertValues } from '../../../testing/testing-utilities';
import {
  AnimatedSignal,
  animatedSignalFactory,
  AnimatedSignalOptions,
  AnimationOptions,
  AnimationState,
  AnimationStepFn,
  WritableAnimatedSignal
} from './animated-signal-base';
import { ValueSource } from '../../value-source';
import { ReactiveSource } from '../../reactive-source';

describe('animatedSignalFactory', () => {
  describe('when passed a value', () => {
    runDebugNameOptionTest((debugName) => createAnimationSignalForTest(1, { debugName }));
    runInjectorOptionTest((injector) => createAnimationSignalForTest(1, { injector }));
    runTypeGuardTests(() => createAnimationSignalForTest(1));

    runComputedAndEffectTests(() => {
      const sut = createAnimationSignalForTest(1, { duration: 500 });
      return [
        sut,
        () => {
          sut.set(2);
          tick(500);
        }
      ];
    });

    it('initially returns the initial value', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(5));
      expect(sut()).toBe(5);
    }));

    it('cleans up when destroyed', fakeAsync(() => {
      const fixture = createFixture();
      const sut = createAnimationSignalForTest(1, { injector: fixture.componentRef.injector, duration: 500 });
      sut.set(5);
      fixture.detectChanges();
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 1],
          [250, 3]
        ]
      );
      fixture.destroy();
      tickAndAssertValues(() => Math.round(sut()), [[250, 3]]);
    }));

    it('returns an in between value when in between duration', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 500 }));
      sut.set(5);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 1],
          [250, 3],
          [250, 5]
        ]
      );
    }));

    it('updates value when update is used', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(5, { duration: 500 }));
      sut.update((x) => x + 4, { duration: 1000 });
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 5],
          [500, 7],
          [500, 9]
        ]
      );
    }));

    it('returns a delayed value when delay is passed', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { delay: 500, duration: 500 }));
      sut.set(5);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 1],
          [500, 1],
          [250, 3],
          [250, 5]
        ]
      );
    }));

    it('returns an interpolated value when interpolator is passed', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() =>
        createAnimationSignalForTest(1, {
          interpolator: (a, b) => (p) => a * (1 - p) + b * p + 1,
          duration: 500
        })
      );
      sut.set(5);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 2],
          [250, 4],
          [250, 6]
        ]
      );
    }));

    it('cancels a previous previously running animation', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(5, { duration: 500 }));
      sut.set(-5);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 5],
          [250, 0]
        ]
      );
      sut.set(8);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 0],
          [250, 4],
          [250, 8]
        ]
      );
    }));

    describe('and using set options to change default animation parameters', () => {
      it('returns an in between value when in between duration', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 100 }));
        sut.setOptions({ duration: 1000 });
        sut.set(5);
        tickAndAssertValues(
          () => Math.round(sut()),
          [
            [0, 1],
            [500, 3],
            [500, 5]
          ]
        );
      }));
      it('returns a delayed value when delay is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { delay: 500, duration: 500 }));
        sut.setOptions({ delay: 1000 });
        sut.set(5);
        tickAndAssertValues(
          () => Math.round(sut()),
          [
            [0, 1],
            [1000, 1],
            [250, 3],
            [250, 5]
          ]
        );
      }));
      it('updates to final value after first effect if step function determines it should be done.', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: -100 }));
        sut.set(5);
        tick();
        expect(sut()).toBe(5);
      }));
      it('maintains the previous state if a new animation starts before the previous one is finished', fakeAsync(() => {
        /* 
        Because state is not immutable spy.toHaveBeenCalledWith will just contain the state of the last call. 
        So, we keep track of the tickCount in the step function and use that to determine that the state was maintained.
        */
        const initialState = { tickCount: 0 };
        let tickCountOuter = 0;

        const stepFn = jasmine.createSpy().and.callFake((state: AnimationState<typeof initialState>, options: TestAnimationOptions) => {
          state.progress = options.duration > 0 ? Math.min(1, state.timeElapsed / options.duration) : 1;
          state.isDone = state.progress === 1;
          tickCountOuter = ++state.tickCount;
        });
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 100 }, stepFn, initialState));
        sut.set(5);
        tick(50);
        const tickCountAtChange = tickCountOuter;
        expect(tickCountAtChange).toBeGreaterThan(0);
        expect(stepFn).toHaveBeenCalledWith(jasmine.objectContaining({ tickCount: tickCountAtChange }), jasmine.anything());
        sut.set(9);
        tick(0);
        expect(tickCountOuter).toBe(tickCountAtChange + 1);
        
      }));
      // fit('updates predictably if for some reason multiple frames occur within the same time interval', fakeAsync(() => {
      //   const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 500 }));
      //   sut.set(5);
      //   tickAndAssertValues(
      //     () => Math.round(sut()),
      //     [
      //       [0, 1],
      //       [0, 1],
      //       [250, 3],
      //       [250, 5]
      //     ]
      //   );
      // }));

      it('returns a interpolated value when interpolator is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 500 }));
        sut.setOptions({ interpolator: (a, b) => (p) => a * (1 - p) + b * p + 2 });
        sut.set(5);
        tickAndAssertValues(
          () => Math.round(sut()),
          [
            [0, 3],
            [250, 5],
            [250, 7]
          ]
        );
      }));
    });

    describe('and overriding defaults when setting a value', () => {
      it('returns an in between value when in between duration', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 100 }));
        sut.set(5, { duration: 1000 });
        tickAndAssertValues(
          () => Math.round(sut()),
          [
            [0, 1],
            [500, 3],
            [500, 5]
          ]
        );
      }));
      it('returns a delayed value when delay is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { delay: 500, duration: 500 }));
        sut.set(5, { delay: 1000 });
        tickAndAssertValues(
          () => Math.round(sut()),
          [
            [0, 1],
            [1000, 1],
            [250, 3],
            [250, 5]
          ]
        );
      }));

      it('returns a interpolated value when interpolator is passed', fakeAsync(() => {
        const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(1, { duration: 500 }));
        sut.set(5, { interpolator: (a, b) => (p) => a * (1 - p) + b * p + 2 });
        tickAndAssertValues(
          () => Math.round(sut()),
          [
            [0, 3],
            [250, 5],
            [250, 7]
          ]
        );
      }));
    });
  });

  describe('when passed a number array', () => {
    it('returns an array of transformed values', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest([0, 10], { duration: 500 }));
      sut.set([10, -10]);
      tickAndAssertValues(
        () => [Math.round(sut()[0]), Math.round(sut()[1])],
        [
          [0, [0, 10]],
          [250, [5, 0]],
          [250, [10, -10]]
        ]
      );
    }));

    it('returns the end value if there are not enough elements in to transition from in the original array', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest([0], { duration: 500 }));
      sut.set([10, -10]);
      tickAndAssertValues(
        () => [Math.round(sut()[0]), Math.round(sut()[1])],
        [
          [0, [0, -10]],
          [250, [5, -10]],
          [250, [10, -10]]
        ]
      );
    }));
  });

  describe('when passed a number record', () => {
    it('returns records with transformed values', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest({ x: 0, y: 10 }, { duration: 500 }));
      sut.set({ x: 10, y: -10 });
      tickAndAssertValues(
        () => ({ x: Math.round(sut().x), y: Math.round(sut().y) }),
        [
          [0, { x: 0, y: 10 }],
          [250, { x: 5, y: 0 }],
          [250, { x: 10, y: -10 }]
        ]
      );
    }));

    it('returns the end value if there are not a matching property to transition from in the original object', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() =>
        createAnimationSignalForTest<Record<string, number>, {}>({ x: 0 }, { duration: 500 })
      );
      sut.set({ x: 10, y: -10 });
      tickAndAssertValues(
        () => ({ x: Math.round(sut()['x']), y: Math.round(sut()['y']) }),
        [
          [0, { x: 0, y: -10 }],
          [250, { x: 5, y: -10 }],
          [250, { x: 10, y: -10 }]
        ]
      );
    }));
  });

  describe('when passed a signal', () => {
    runDebugNameOptionTest((debugName) => createAnimationSignalForTest(signal(1), { debugName }));
    runInjectorOptionTest((injector) => createAnimationSignalForTest(signal(1), { injector }));
    runTypeGuardTests(() => createAnimationSignalForTest(signal(1)));

    runComputedAndEffectTests(() => {
      const source = signal(1);
      const sut = createAnimationSignalForTest(source, { duration: 500 });
      return [
        sut,
        () => {
          source.set(2);
          tick(500);
        }
      ];
    });

    it('returns transitioned values', fakeAsync(() => {
      const source = signal(5);
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(source, { duration: 500 }));
      source.set(9);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 5],
          [250, 7],
          [250, 9]
        ]
      );
    }));

    it('#setOptions updates the options for all future animations', fakeAsync(() => {
      const source = signal(1);
      const sut = TestBed.runInInjectionContext(() => createAnimationSignalForTest(source, { duration: 100 }));
      sut.setOptions({ duration: 1000 });
      source.set(5);
      tickAndAssertValues(
        () => Math.round(sut()),
        [
          [0, 1],
          [500, 3],
          [500, 5]
        ]
      );
    }));
  });
});

interface TestAnimationOptions extends AnimationOptions {
  duration: number;
}

/**
 * Creates an animated signal for testing.
 * @param source The value source for the signal
 * @param signalOptions Animation options to the signal that came from the user.
 * @param stepFn A step function to use, if none is passed a linear step function will be used.
 * @param initialState A state bag, if none is provided then an empty object will be used.
 * @returns
 */
function createAnimationSignalForTest<TVal, TState extends object>(
  source: ValueSource<TVal>,
  signalOptions?: Partial<AnimatedSignalOptions<TVal, TestAnimationOptions>>,
  stepFn?: AnimationStepFn<TState, TestAnimationOptions>,
  initialState?: any
): typeof source extends ReactiveSource<TVal>
  ? AnimatedSignal<TVal, TestAnimationOptions>
  : WritableAnimatedSignal<TVal, TestAnimationOptions> {

  return animatedSignalFactory(
    source,
    signalOptions,
    { duration: 500, delay: 0 },
    initialState ?? { duration: 500 },
    stepFn ?? ((state, options) => {
      state.progress = options.duration > 0 ? Math.min(1, state.timeElapsed / options.duration) : 1;
      state.isDone = state.progress === 1;
    })
  ) as any; // can't seem to get the types right here.
}
