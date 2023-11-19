import { Injector, Signal, ValueEqualityFn, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SignalInput } from '../signal-input';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { ValueSource } from '../value-source';
import { AnimationFrameFn, EasingName, getRequestAnimationFrame, getEasingFn } from '../internal/animations';


/** Request animation frame function */
const requestAnimationFrame = getRequestAnimationFrame();

/** Returns a value at a time *roughly* between 0 and 1. */
export type InterpolateStepFn<T> = (progress: number) => T;
/** Returns a function that will return an interpolated value at an point in time. */
export type InterpolateFactoryFn<T> = (a:T, b: T) => InterpolateStepFn<T>;
/** Either a built-in easing name, or a function that alters progress. */
export type EasingOptionValue = EasingName | ((progress: number) => number);

/** Options that can be used to overwrite default options. */
export interface TweenOptions<T> {
  /** A delay before starting. */
  delay?: number;
  /** If not provided then a default of 400 is used. */
  duration?: number;
  /** An easing function that distorts progress. */
  easing?: EasingOptionValue;
  /** A function used to determine the intermediate value */
  interpolator?: InterpolateFactoryFn<T>;
}
/** Options for initializing a tween signal. */
export interface TweenSignalOptions<T> extends TweenOptions<T> {
  equal?: ValueEqualityFn<T>;
  /** This is only used if a signal is created from an observable. */
  injector?: Injector;
  /** The interpolator is required unless numeric values are used. */
  interpolator: InterpolateFactoryFn<T>;
  /** A function to get the next animation frame. */
  raf?: AnimationFrameFn;
}

/** When using a number, array of numbers, or record of numbers, interpolation is automatically performed by tweenSignal. */
export type TweenNumericValues = number | number[] | Record<string | number | symbol, number>;
/** Same as regular TweenSignal options, but interpolator is not required. */
export type TweenNumericSignalOptions<T extends TweenNumericValues> = Omit<TweenSignalOptions<T>, 'interpolator'> & Partial<Pick<TweenSignalOptions<T>, 'interpolator'>>;
/** Like a writable a signal, but without mutate. */
export interface TweenSignal<T> extends Signal<T> {
  /** Sets the value of signal with optional options, */
  set(value: T, options?: TweenOptions<T>): void;
  /** Update the value of the signal based on its current value.  */
  update(updateFn: (value: T) => T, options?: TweenOptions<T>): void;
  /** Returns a readonly version of this signal */
  asReadonly(): Signal<T>;
}

// for some reason extends TweenNumericValues acted weird for number types.
export function tweenSignal<V extends ValueSource<number>>(source: V, options?: TweenNumericSignalOptions<number>):
  V extends SignalInput<number> ? Signal<number> : TweenSignal<number>
export function tweenSignal<T extends TweenNumericValues>(source: ValueSource<T>, options?: TweenNumericSignalOptions<T>):
  typeof source extends SignalInput<T> ? Signal<T> : TweenSignal<T>
export function tweenSignal<T>(source: ValueSource<T>, options: TweenSignalOptions<T>):
  typeof source extends SignalInput<T> ? Signal<T> : TweenSignal<T>
/**
 * Creates a signal whose value morphs from the old value to the new over a specified duration.
 * @param source Either a value, signal, observable, or function that can be used in a computed function.
 * @param options Options for the signal.  If a number, number[] or Record<string | number symbol, number>
 * is passed then this is not required.  Otherwise an interpolator is required to translate the change of the value.
 * @example
 * ```ts
 * const fastLinearChange = tweenSignal(1);
 * const slowEaseInChange = tweenSignal(1, { duration: 5000, easing: 'easeInQuad' });
 * function demo(): void {
 *   fastLinearChange.set(5); // in 400ms will display something like 1, 1.453, 2.134, 3.521, 4.123, 5.
 *   slowEaseInChange.set(5, { duration: 10000 }); // in 10000ms will display something like 1, 1.21, 1.4301...
 * }
 * ```
 */
export function tweenSignal<T, V extends ValueSource<T>>(source: V, options?: Partial<TweenSignalOptions<T>>):
  V extends SignalInput<T> ? Signal<T> : TweenSignal<T>
{

  let output: WritableSignal<T>;
  let outputSet: (value: T) => void;
  /** Normalizes output of the source signal since it is different when this is writable. */
  let signalValueGetter: () => [value: T, options: TweenOptions<T> | undefined];

  if (isSignalInput<T>(source)) {
    const srcSignal = coerceSignal(source, options);
    output = signal(srcSignal());
    outputSet = output.set;
    signalValueGetter = () => [srcSignal(), undefined];
  }
  else {
    output = signal(source as T);
    outputSet = output.set;
    const srcSignal = signal<[value: T, options: TweenOptions<T> | undefined]>([source as T, undefined]);
    signalValueGetter = srcSignal;
    Object.assign(output, {
      // mutate doesn't make much sense
      // mutate: (mutatorFn: (value: T) => void, options?: TweenOptions<T>) => srcSignal.mutate(([value]) => [mutatorFn(value), options]),
      set: (x: T, options?: TweenOptions<T>) => srcSignal.set([x, options]),
      update: (updateFn: (value: T) => T, options?: TweenOptions<T>) => srcSignal.update(([value]) => [updateFn(value), options])
    });
  }

  const defaultDelay = options?.delay || 0;
  const defaultDuration = options?.duration || 400;
  const defaultEasing = easingOptionToFn(options?.easing);
  const defaultInterpolateFactoryFn = options?.interpolator ?? createInterpolator(output() as TweenNumericValues);


  let delayTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let instanceId = 0;

  effect((onCleanup) => {
    const priorValue = untracked(output);
    const [nextValue, overrideOptions] = signalValueGetter();
    const delay = overrideOptions?.delay || defaultDelay;
    const duration = overrideOptions?.duration || defaultDuration;
    const easing = overrideOptions?.easing ? easingOptionToFn(overrideOptions.easing) : defaultEasing;
    const interpolate = (overrideOptions?.interpolator || defaultInterpolateFactoryFn)(priorValue, nextValue);
    const thisInstanceId = ++instanceId;
    let start: number;
    let previousTime: number;

    clearTimeout(delayTimeoutId);
    if (delay) {
      delayTimeoutId = setTimeout(() => {
        start = Date.now();
        requestAnimationFrame(step);
      }, delay);
    }
    else {
      start = Date.now();
      requestAnimationFrame(step);
    }
    function step(): void {
      const time = Date.now();
      if (thisInstanceId !== instanceId || previousTime === time) {
        return; // another effect has occurred or not enough time elapsed.
      }
      previousTime = time;
      const elapsed = time - start;
      const progress = Math.max(0, Math.min(1, elapsed / duration));
      outputSet.call(output, interpolate(easing(progress)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    // force stop by incrementing instanceId on destroy.
    onCleanup(() => instanceId++);
  }, options);


  return output;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createInterpolator<T extends TweenNumericValues>(currentValue: T): InterpolateFactoryFn<any> {
    function interpolateNumber(a: number, b: number, progress: number): number {
      return a * (1 - progress) + b * progress;
    }
    if (typeof currentValue === 'number') {
      return (a: number, b: number) => (progress: number) => interpolateNumber(a, b, progress);
    }
    else if (Array.isArray(currentValue)) {
      return (a: number[], b: number[]) =>
        (progress: number) => b.map((val, index) => interpolateNumber(a[index] ?? val, val, progress));
    }
    return (a: Record<string | number | symbol, number>, b: Record<string | number | symbol, number>) =>
      (progress: number) => Object.entries(b).reduce((acc, cur) => {
        acc[cur[0]] = interpolateNumber(a[cur[0]] ?? cur[1], cur[1], progress);
        return acc;
      }, {} as typeof b);
  }

  /** Gets an easing function, returning a dummy one if easingOpt is undefined. */
  function easingOptionToFn(easingOpt?: EasingOptionValue): (progress: number) => number {
    return easingOpt ?
      typeof easingOpt === 'string' ? getEasingFn(easingOpt) : easingOpt
      : ((x: number) => x);
  }
}


