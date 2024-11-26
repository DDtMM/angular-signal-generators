import { ReactiveSource } from '../../reactive-source';
import { ValueSource } from '../../value-source';
import { AnimatedSignal, AnimatedSignalOptions, AnimationOptions, WritableAnimatedSignal, animatedSignalFactory } from './animated-signal-base';
import { NumericValues } from './interpolation';

/**
 * Options that can be used to overwrite default options when calling {@link SpringSignal.setOptions},
 * {@link WritableSpringSignal.set}, or {@link WritableSpringSignal.update}.
 */
export interface SpringOptions extends AnimationOptions {
  /** If true, will stay with the bounds of the starting and ending value during transitions. */
  clamp: boolean;
  /** The degree to suppress spring oscillation. The higher the value, the less movement.*/
  damping: number;
  /** How close the velocity must be to 0 and progress the final value before the animation is considered done. */
  precision: number;
  /** 
   * Effects how quickly the animation changes direction. 
   * The higher the value, the sooner the spring will reach the end and bounce back.
   */
  stiffness: number;
}


/** Options for {@link springSignal}. */
export type SpringSignalOptions<T> = AnimatedSignalOptions<T, SpringOptions>;

/** Same as regular {@link SpringSignalOptions}, but interpolator is not required. */
export type SpringNumericSignalOptions<T extends NumericValues> = Omit<SpringSignalOptions<T>, 'interpolator'> & Partial<Pick<SpringSignalOptions<T>, 'interpolator'>>;

/** A signal with a function to set animation parameters returned from {@link springSignal}. */
export type SpringSignal<T> = AnimatedSignal<T, SpringOptions>;

/** Returned from returned from {@link springSignal}. It's like a writable a signal, but with extended options when setting and updating. */
export type WritableSpringSignal<T> = WritableAnimatedSignal<T, SpringOptions>;

const DEFAULT_OPTIONS: SpringOptions = {
  clamp: false,
  damping: 3,
  delay: 0,
  precision: 0.01,
  stiffness: 100
};

// for some reason extends NumericValues acted weird for number types.
export function springSignal<V extends ValueSource<number>>(source: V, options?: SpringNumericSignalOptions<number>):
  V extends ReactiveSource<number> ? SpringSignal<number> : WritableSpringSignal<number>
export function springSignal<T extends NumericValues>(source: ValueSource<T>, options?: SpringNumericSignalOptions<T>):
  typeof source extends ReactiveSource<T> ? SpringSignal<T> : WritableSpringSignal<T>
export function springSignal<T>(source: ValueSource<T>, options: SpringSignalOptions<T>):
  typeof source extends ReactiveSource<T> ? SpringSignal<T> : WritableSpringSignal<T>
/**
 * Creates a signal whose value morphs from the old value to the new over a specified duration.
 * @param source Either a value, signal, observable, or function that can be used in a computed function.
 * @param options Options for the signal.  If a number, number[] or Record<string | number symbol, number>
 * is passed then this is not required.  Otherwise an interpolator is required to translate the change of the value.
 * @example
 * ```ts
 * const fastLinearChange = springSignal(1);
 * const slowEaseInChange = springSignal(1, { duration: 5000, easing: easeInQuad });
 * function demo(): void {
 *   fastLinearChange.set(5); // in 400ms will display something like 1, 1.453, 2.134, 3.521, 4.123, 5.
 *   slowEaseInChange.set(5, { duration: 10000 }); // in 10000ms will display something like 1, 1.21, 1.4301...
 * }
 * ```
 */
export function springSignal<T, V extends ValueSource<T>>(source: V, options?: Partial<SpringSignalOptions<T>>):
  V extends ReactiveSource<T> ? SpringSignal<T> : WritableSpringSignal<T>
{
  return animatedSignalFactory(source, options, DEFAULT_OPTIONS, { velocity: 1 }, (state, options) => {
    
    const dt = state.timeDelta / 1000;
    const force = -options.stiffness * (state.progress - 1) ;
    const damping = options.damping  * state.velocity;
    const acceleration = force - damping;
    state.velocity += acceleration * dt;    
    state.progress += state.velocity * dt;

    if (Math.abs(1 - state.progress) < options.precision && Math.abs(state.velocity / dt) <= options.precision / dt) {
      state.isDone = true;
      state.progress = 1;
      return;
    }
    if (options.clamp && state.progress > 1) {
      state.progress = 2 - state.progress;
      state.velocity = -state.velocity + damping * dt;
    }
  });
}

