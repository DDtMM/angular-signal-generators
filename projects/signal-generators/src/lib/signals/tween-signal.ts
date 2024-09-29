import { Injector, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal, signalSetFn, signalUpdateFn } from '@angular/core/primitives/signals';
import { AnimationFrameFn, getRequestAnimationFrame } from '../internal/animations';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { SignalInput } from '../signal-input';
import { ValueSource } from '../value-source';

/** Request animation frame function */
const requestAnimationFrame = getRequestAnimationFrame();

/** Returns a value at a time *roughly* between 0 and 1. */
export type InterpolateStepFn<T> = (progress: number) => T;
/** Returns a function that will return an interpolated value at an point in time. */
export type InterpolateFactoryFn<T> = (a:T, b: T) => InterpolateStepFn<T>;
/** A function that alters progress between 0 and 1. */
export type EasingFn = ((progress: number) => number);

/**
 * Options that can be used to overwrite default options when calling {@link TweenSignal.setOptions},
 * {@link WritableTweenSignal.set}, or {@link WritableTweenSignal.update}.
 */
export interface TweenOptions<T> {
  /** A delay before starting. */
  delay?: number;
  /** If not provided then a default of 400 is used. */
  duration?: number;
  /** An easing function that distorts progress. */
  easing?: EasingFn;
  /** A function used to determine the intermediate value */
  interpolator?: InterpolateFactoryFn<T>;
}
/** Options for initializing a tween signal. */
export interface TweenSignalOptions<T> extends TweenOptions<T> {
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

/** A signal with a function to set animation parameters returned from {@link tweenSignal}. */
export interface TweenSignal<T> extends Signal<T>
{
  /** Sets the default animation parameters for the signal.  This won't updated a running animation. */
  setOptions(options: TweenOptions<T>): void;
}

/** Returned from returned from {@link tweenSignal}. It's like a writable a signal, but with extended options when setting and updating. */
export interface WritableTweenSignal<T> extends TweenSignal<T> {
  /** Sets the value of signal with optional options. */
  set(value: T, options?: TweenOptions<T>): void;
  /** Update the value of the signal based on its current value.  */
  update(updateFn: (value: T) => T, options?: TweenOptions<T>): void;
  /** Returns a readonly version of this signal */
  asReadonly(): Signal<T>;
}

// for some reason extends TweenNumericValues acted weird for number types.
export function tweenSignal<V extends ValueSource<number>>(source: V, options?: TweenNumericSignalOptions<number>):
  V extends SignalInput<number> ? TweenSignal<number> : WritableTweenSignal<number>
export function tweenSignal<T extends TweenNumericValues>(source: ValueSource<T>, options?: TweenNumericSignalOptions<T>):
  typeof source extends SignalInput<T> ? TweenSignal<T> : WritableTweenSignal<T>
export function tweenSignal<T>(source: ValueSource<T>, options: TweenSignalOptions<T>):
  typeof source extends SignalInput<T> ? TweenSignal<T> : WritableTweenSignal<T>
/**
 * Creates a signal whose value morphs from the old value to the new over a specified duration.
 * @param source Either a value, signal, observable, or function that can be used in a computed function.
 * @param options Options for the signal.  If a number, number[] or Record<string | number symbol, number>
 * is passed then this is not required.  Otherwise an interpolator is required to translate the change of the value.
 * @example
 * ```ts
 * const fastLinearChange = tweenSignal(1);
 * const slowEaseInChange = tweenSignal(1, { duration: 5000, easing: easeInQuad });
 * function demo(): void {
 *   fastLinearChange.set(5); // in 400ms will display something like 1, 1.453, 2.134, 3.521, 4.123, 5.
 *   slowEaseInChange.set(5, { duration: 10000 }); // in 10000ms will display something like 1, 1.21, 1.4301...
 * }
 * ```
 */
export function tweenSignal<T, V extends ValueSource<T>>(source: V, options?: Partial<TweenSignalOptions<T>>):
  V extends SignalInput<T> ? TweenSignal<T> : WritableTweenSignal<T>
{
  const [
    /** The output signal that will be returned and have methods added it it if writable. */
    $output,
    /** A function that will get the current value of the source.  It could be a signal */
    signalValueFn
  ] = (isSignalInput<T>(source))
    ? createFromSignalInput(source, options)
    : createFromValue(source as T);

  /** THe SignalNode of the output signal.  Used when the output is set during value changes.  */
  const outputNode = $output[SIGNAL];

  let defaultDelay = options?.delay ?? 0;
  let defaultDuration = options?.duration ?? 400;
  let defaultEasing = options?.easing || ((x: number) => x);
  let defaultInterpolateFactoryFn = options?.interpolator ?? createInterpolator($output() as TweenNumericValues);
  let delayTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let instanceId = 0;

  effect((onCleanup) => {
    const priorValue = untracked($output);
    const [nextValue, overrideOptions] = signalValueFn();
    const delay = overrideOptions?.delay || defaultDelay;
    const duration = overrideOptions?.duration || defaultDuration;
    const easing = overrideOptions?.easing || defaultEasing;
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
      const progress = Math.max(0, Math.min(1, (time - start) / duration));
      signalSetFn(outputNode, interpolate(easing(progress)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    // force stop by incrementing instanceId on destroy.
    onCleanup(() => instanceId++);
  }, options);

  return $output;

  /** Creates an interpolator of a TweenNumericValues type. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createInterpolator<T extends TweenNumericValues>(currentValue: T): InterpolateFactoryFn<any> {

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

    function interpolateNumber(a: number, b: number, progress: number): number {
      return a * (1 - progress) + b * progress;
    }
  }

  /** Coerces a source signal from signal input and creates the output signal.. */
  function createFromSignalInput(sourceSignalInput: SignalInput<T>, options: Partial<TweenSignalOptions<T>> | undefined):
    [output: SignalGetter<T> & WritableTweenSignal<T>, valueFn: () => Readonly<[value: T, options: TweenOptions<T> | undefined]> ] {
    const $source = coerceSignal(sourceSignalInput, options);
    const $output = signal(untracked($source)) as SignalGetter<T> & WritableSignal<T> & TweenSignal<T>;
    $output.setOptions = setOptions;
    const signalValueFn = () => [$source(), undefined] as const;
    return [$output, signalValueFn];
  }

  /** Creates a writable source signal and output signal from the initial value. */
  function createFromValue(sourceValue: T):
    [output: SignalGetter<T> & WritableTweenSignal<T>, valueFn: () => Readonly<[value: T, options: TweenOptions<T> | undefined]> ] {

    const $output = signal(sourceValue) as SignalGetter<T> & WritableSignal<T> & TweenSignal<T>;
    const $source = createSignal<Readonly<[value: T, options: TweenOptions<T> | undefined]>>([sourceValue as T, undefined]);
    const sourceNode = $source[SIGNAL];
    $output.set = (x: T, options?: TweenOptions<T>) => signalSetFn(sourceNode, [x, options] as const);
    $output.setOptions = setOptions;
    $output.update = (updateFn: (value: T) => T, options?: TweenOptions<T>) =>
      signalUpdateFn(sourceNode, ([value]) => [updateFn(value), options] as const);
    const signalValueFn = $source;
    return [$output, signalValueFn];
  }

  /** Function that is applied to return signal that sets default animation parameters. */
  function setOptions(options: TweenOptions<T>): void {
    defaultDelay = options?.delay ?? defaultDelay;
    defaultDuration = options?.duration ?? defaultDuration;
    defaultEasing = options?.easing ?? defaultEasing;
    defaultInterpolateFactoryFn = options?.interpolator ?? defaultInterpolateFactoryFn;
  }
}


