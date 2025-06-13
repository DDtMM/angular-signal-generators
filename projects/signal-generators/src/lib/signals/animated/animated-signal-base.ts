import { CreateSignalOptions, Injector, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal, signalSetFn } from '@angular/core/primitives/signals';
import { isReactive } from '../../internal/reactive-source-utilities';
import { coerceSignal } from '../../internal/signal-coercion';
import { ReactiveSource } from '../../reactive-source';
import { ValueSource } from '../../value-source';
import { AnimationFrameFn, getRequestAnimationFrame } from './animation-utilities';
import { InterpolateFactoryFn, NumericValues, createInterpolator } from './interpolation';

/** Request animation frame function */
const requestAnimationFrame = getRequestAnimationFrame();

/**
 * Options that can be used to overwrite default options when calling {@link AnimatedSignal.setOptions},
 * {@link WritableAnimatedSignal.set}, or {@link WritableAnimatedSignal.update}.
 */
export interface AnimationOptions {
  /** A delay before starting. */
  delay: number;
}

export type AnimationState<TState> = TState & {
  /** If the animation is done. */
  isDone: boolean;
  /** How far has the animation progressed as a percent, though it can fall outside 0 and 1. */
  progress: number;
  timeCurrent: number;
  timeElapsed: number;
  timeDelta: number;
  timeStart: number;
}

export type AnimationOptionsWithInterpolator<TVal, TOpt extends AnimationOptions> = TOpt & {
  interpolator: InterpolateFactoryFn<TVal>;
}

/** Options for an {@link AnimatedSignal}. */
export type AnimatedSignalOptions<TVal, TOpt extends AnimationOptions> = Partial<TOpt> &
  Pick<CreateSignalOptions<TVal>, 'debugName'> & {
    /** This is only used if a signal is created from an observable. */
    injector?: Injector;
    /** The interpolator is required unless numeric values are used. */
    interpolator: InterpolateFactoryFn<TVal>;
    /** A function to get the next animation frame.  Defaults to window.requestAnimationFrame in browser context. */
    raf?: AnimationFrameFn;
  };

/** Same as regular {@link AnimatedSignalOptions}, but interpolator is not required. */
export type AnimatedNumericSignalOptions<TVal extends NumericValues, TOpt extends AnimationOptions> = Omit<
  AnimatedSignalOptions<TVal, TOpt>,
  'interpolator'
> &
  Partial<Pick<AnimatedSignalOptions<TVal, TOpt>, 'interpolator'>>;

export interface AnimatedSignal<TVal, TOpt extends AnimationOptions> extends Signal<TVal> {
  /** Sets the default animation parameters for the signal. */
  setOptions(options: Partial<AnimationOptionsWithInterpolator<TVal, TOpt>>): void;
}
export interface WritableAnimatedSignal<TVal, TOpt extends AnimationOptions> extends AnimatedSignal<TVal, TOpt> {
  /** Sets the value of signal with optional animation options during the next transition. */
  set(value: TVal, oneTimeOptions?: Partial<AnimationOptionsWithInterpolator<TVal, TOpt>>): void;
  /** Update the value of the signal based on its current value, with optional animation options used during the next transition.  */
  update(updateFn: (value: TVal) => TVal, oneTimeOptions?: Partial<AnimationOptionsWithInterpolator<TVal, TOpt>>): void;
  /** Returns a readonly version of this signal */
  asReadonly(): Signal<TVal>;
}

/**
 * A function executed with each step.
 * @param state An object that maintains any variables that need be maintained throughout the animation.
 * @param options Options for the animation.
 * @typeParam TState An object that maintains any variables that need be maintained throughout the animation.
 */
export type AnimationStepFn<TState extends object, TOpt extends AnimationOptions> = (
  state: AnimationState<TState>,
  options: TOpt
) => void;

// export function animatedSignalFactory<V extends ValueSource<number>, O extends AnimationOptions, TState extends object>(
//   source: V, 
//   options: Partial<AnimatedNumericSignalOptions<number, O>> | undefined,
//   defaultAnimationOptions: Required<O>,
//   initialState: TState,
//   stepFn: AnimationStepFn<TState, O>
// ): V extends ReactiveSource<number> ? AnimatedSignal<number, O> : WritableAnimatedSignal<number, O>
// export function animatedSignalFactory<T extends NumericValues, V extends ValueSource<T>, O extends AnimationOptions, TState extends object>(
//   source: V, 
//   options: Partial<AnimatedNumericSignalOptions<T, O>> | undefined,
//   defaultAnimationOptions: Required<O>,
//   initialState: TState,
//   stepFn: AnimationStepFn<TState, O>
// ): V extends ReactiveSource<T> ? AnimatedSignal<T, O> : WritableAnimatedSignal<T, O>
// export function animatedSignalFactory<T, V extends ValueSource<T>, O extends AnimationOptions, TState extends object>(
//   source: V, 
//   options: Partial<AnimatedSignalOptions<T, O>> | undefined,
//   defaultAnimationOptions: Required<O>,
//   initialState: TState,
//   stepFn: AnimationStepFn<TState, O>
// ): V extends ReactiveSource<T> ? AnimatedSignal<T, O> : WritableAnimatedSignal<T, O>
export function animatedSignalFactory<T, V extends ValueSource<T>, O extends AnimationOptions, TState extends object>(
  source: V,
  options: Partial<AnimatedSignalOptions<T, O>> | undefined,
  defaultAnimationOptions: O,
  initialState: TState,
  stepFn: AnimationStepFn<TState, O>
): V extends ReactiveSource<T> ? AnimatedSignal<T, O> : WritableAnimatedSignal<T, O> {
  const [
    /** The output signal that will be returned and have methods added it it if writable. */
    $output,
    /** A function that will get the current value of the source.  It could be a signal */
    signalValueFn
  ] = isReactive<T>(source) ? createFromReactiveSource(source, options) : createFromValue(source as T, options);

  /** THe SignalNode of the output signal.  Used when the output is set during value changes.  */
  const outputNode = $output[SIGNAL];
  // can't just use a spread since an option can be undefined.
  const defaults = {
    ...defaultAnimationOptions,
    interpolator: options?.interpolator || (createInterpolator(outputNode.value as NumericValues) as InterpolateFactoryFn<T>)
  };
  if (options) {
    overwriteProperties(defaults, options as Partial<O>);
  }

  let delayTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let instanceId = 0;
  let state: AnimationState<TState>;
  effect((onCleanup) => {
    const priorValue = untracked($output);
    const [nextValue, overrideOptions] = signalValueFn();
    if (nextValue === priorValue) {
      // since an array is being passed from signalValueFn, it could be the same value was sent.
      return;
    }
    const animationOptions = overrideOptions ? { ...overwriteProperties({ ...defaults }, overrideOptions) } : defaults;
    const interpolate = (overrideOptions?.interpolator || defaults.interpolator)(priorValue, nextValue);
    const thisInstanceId = ++instanceId;

    // in case a previous animation was delayed then clear it before it starts.
    clearTimeout(delayTimeoutId);
    if (animationOptions.delay) {
      delayTimeoutId = setTimeout(start, animationOptions.delay);
    } else {
      start();
    }

    function start(): void {
      const timeCurrent = Date.now(); // performance.now can't be tested [SAD EMOJI] (switch to Jest?)
      state = {
        ...initialState,
        ...state,
        isDone: false,
        progress: 0,
        timeCurrent,
        timeElapsed: 0,
        timeDelta: 0,
        timeStart: timeCurrent,
      };

      stepFn(state, animationOptions); // run initial step function in case animation isn't necessary.
      if (state.isDone) {
        // don't bother with the animation since its done already.
        signalSetFn(outputNode, nextValue);
        return;
      }
      signalSetFn(outputNode, interpolate(state.progress));
      requestAnimationFrame(step);
    }
    
    function step(): void {
  
      if (thisInstanceId !== instanceId) {
        return; // another effect has occurred.
      }
      // I'm not sure if this is necessary.  It might have been something I copied from an animation example.
      // if (previousTime === time) {
      //   requestAnimationFrame(step); // no time elapsed.
      //   return;
      // }
      const timeCurrent = Date.now(); // performance.now can't be tested [SAD EMOJI] (switch to Jest?)
      state.timeDelta = timeCurrent - state.timeCurrent;
      state.timeCurrent = timeCurrent;
      state.timeElapsed = timeCurrent - state.timeStart;
      stepFn(state, animationOptions);
      signalSetFn(outputNode, interpolate(state.progress));
      if (!state.isDone) {
        requestAnimationFrame(step);
      }
    }
    // force stop by incrementing instanceId on destroy.
    onCleanup(() => instanceId++);
  }, options);

  return $output;

  /** Coerces a source signal from signal input and creates the output signal.. */
  function createFromReactiveSource(
    reactiveSource: ReactiveSource<T>,
    signalOptions: Partial<AnimatedSignalOptions<T, O>> | undefined
  ): [
    output: SignalGetter<T> & WritableAnimatedSignal<T, O>,
    valueFn: () => Readonly<[value: T]>
  ] {
    const $source = coerceSignal(reactiveSource, signalOptions);
    const $output = signal(untracked($source), signalOptions) as SignalGetter<T> & WritableSignal<T> & AnimatedSignal<T, O>;
    $output.setOptions = (options) => overwriteProperties(defaults, options);
    const signalValueFn = () => [$source()] as const;
    return [$output, signalValueFn];
  }

  /** Creates a writable source signal and output signal from the initial value. */
  function createFromValue(
    sourceValue: T,
    signalOptions: Partial<AnimatedSignalOptions<T, O>> | undefined
  ): [
    output: SignalGetter<T> & WritableAnimatedSignal<T, O>,
    valueFn: () => Readonly<[value: T, oneTimeOptions: Partial<AnimationOptionsWithInterpolator<T, O>> | undefined]>
  ] {
    const $output = signal(sourceValue, signalOptions) as SignalGetter<T> & WritableSignal<T> & AnimatedSignal<T, O>;
    const [get, set, update] = createSignal<
      Readonly<[value: T, options: Partial<AnimationOptionsWithInterpolator<T, O>> | undefined]>
    >([sourceValue as T, undefined]);

    $output.set = (x, options?: Partial<AnimationOptionsWithInterpolator<T, O>>) => set([x, options] as const);
    $output.setOptions = (options) => overwriteProperties(defaults, options);
    $output.update = (updateFn: (value: T) => T, options?: Partial<O & { interpolator: InterpolateFactoryFn<T> }>) =>
      update(([value]) => [updateFn(value), options] as const);
    return [$output, get];
  }
}
/**
 * Sets values on {@link target} if they are defined in both {@link target} and {@link values}.
 * Different then spread operator as it will ignore undefined values.
 * @returns The value of {@link target}.
 */
function overwriteProperties<T extends object>(target: T, values: Partial<T>): T {
  Object.entries(values).forEach(([key, value]) => {
    if (key in target && value !== undefined) {
      target[key as keyof T] = value as T[keyof T];
    }
  });
  return target;
}
