import { ReactiveSource } from '../../reactive-source';
import { ValueSource } from '../../value-source';
import { AnimatedSignal, AnimatedSignalOptions, AnimationOptions, WritableAnimatedSignal, animatedSignalFactory } from './animated-signal-base';
import { NumericValues } from './interpolation';



/** A function that alters progress between 0 and 1. */
export type EasingFn = ((progress: number) => number);

/**
 * Options that can be used to overwrite default options when calling {@link TweenSignal.setOptions},
 * {@link WritableTweenSignal.set}, or {@link WritableTweenSignal.update}.
 */
export interface TweenOptions extends AnimationOptions {
  /** How long the animation should last. */
  duration: number;
  /** An easing function that distorts progress. */
  easing: EasingFn;
}

/** Options for {@link tweenSignal}. */
export type TweenSignalOptions<T> = AnimatedSignalOptions<T, TweenOptions>;

/** Same as regular {@link SpringSignalOptions}, but interpolator is not required. */
export type TweenNumericSignalOptions<T extends NumericValues> = Omit<TweenSignalOptions<T>, 'interpolator'> & Partial<Pick<TweenSignalOptions<T>, 'interpolator'>>;

/** A signal with a function to set animation parameters returned from {@link tweenSignal}. */
export type TweenSignal<T> = AnimatedSignal<T, TweenOptions>;

/** Returned from returned from {@link tweenSignal}. It's like a writable a signal, but with extended options when setting and updating. */
export type WritableTweenSignal<T> = WritableAnimatedSignal<T, TweenOptions>;

const DEFAULT_OPTIONS: TweenOptions = {
  delay:  0,
  duration:  400,
  easing: (x: number) => x
};
// for some reason extends TweenNumericValues acted weird for number types.
export function tweenSignal<V extends ValueSource<number>>(source: V, options?: TweenNumericSignalOptions<number>):
  V extends ReactiveSource<number> ? TweenSignal<number> : WritableTweenSignal<number>
export function tweenSignal<T extends NumericValues>(source: ValueSource<T>, options?: TweenNumericSignalOptions<T>):
  typeof source extends ReactiveSource<T> ? TweenSignal<T> : WritableTweenSignal<T>
export function tweenSignal<T>(source: ValueSource<T>, options: TweenSignalOptions<T>):
  typeof source extends ReactiveSource<T> ? TweenSignal<T> : WritableTweenSignal<T>
/**
 * Creates a signal whose value morphs from the old value to the new over a specified duration.
 * @param source Either a value, signal, observable, or function that can be used in a computed function.
 * @param options Options for the signal.  If a number, number[] or Record<string | number symbol, number>
 * is passed then this is not required.  Otherwise an interpolator is required to translate the change of the value.
 * @example
 * ```ts
 * const fastLinearChange = tweenSignal(1);
 * const slowEaseInChange = tweenSignal(1, { duration: 5000, easing: (x) => return  x ** 2; });
 * function demo(): void {
 *   fastLinearChange.set(5); // in 400ms will display something like 1, 1.453, 2.134, 3.521, 4.123, 5.
 *   slowEaseInChange.set(5, { duration: 10000 }); // in 10000ms will display something like 1, 1.21, 1.4301...
 * }
 * ```
 */
export function tweenSignal<T, V extends ValueSource<T>>(source: V, options?: Partial<TweenSignalOptions<T>>):
  V extends ReactiveSource<T> ? TweenSignal<T> : WritableTweenSignal<T>
{
  return animatedSignalFactory(
    source, 
    options, 
    DEFAULT_OPTIONS, 
    { }, 
    (state, options) => {
      const timeProgress = options.duration > 0 ? Math.min(1, state.timeElapsed / options.duration) : 1;
      state.isDone = timeProgress === 1;
      state.progress = options.easing(timeProgress);
    });

}


