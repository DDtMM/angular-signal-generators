import { CreateEffectOptions, effect, EffectCleanupRegisterFn, EffectRef, untracked } from '@angular/core';

/** Options that control the behavior of {@link gatedEffect}. */
export interface GatedEffectOptions extends CreateEffectOptions {
  /** Prevents execution of the effect if this returns false. */
  filter?: () => boolean;
  /**
   * A condition that will prevent the effect from running until it is true.  
   * Once it is true once, it will not be checked again. 
   */
  start?: () => boolean;
  /** 
   * The number of times the effect should run.  
   * Only increments if the effect function is run, so occasions where {@link filter} or {@link start} return false aren't counted.  
   * If {@link until} is also set, then whichever comes first will terminate the effect. 
   */
  times?: number;
  /** 
   * A condition that will terminate the effect.  
   * If {@link times} is also set, then whichever comes first will terminate the effect. 
   */
  until?: () => boolean;
}

/** 
 * An effect that will start, stop, or conditionally run based on conditions set in the {@link GatedEffectOptions}. 
 * This is most effective for stopping an effect as it will properly clean up after itself and not track signals unnecessarily.
 * 
 * @param effectFn The function to be executed whenever all gate conditions are met.
 * @param options Standard effect options, plus gate conditions filter (condition that prevents running), 
 * start (start running effect), times (number of times to execute), and until (stop running effect)
 * @example 
 * ```ts
 * const $userInfo = signal<UserInfo | undefined>(undefined);
 * gatedEffect(() => doSomethingWithRequiredUserInfo($userInfo()!), { start: () => $userInfo() !== undefined, times: 1 });
 * ```
 */
export function gatedEffect(effectFn: (onCleanup: EffectCleanupRegisterFn) => void, options: GatedEffectOptions = {}): EffectRef {
  /** Tracks the amount of times run, only valid if the {@link GatedEffectOptions.times} is set. */
  let timesRun = 0;
  // These are destructured because changes in the object could cause side effects.
  const { filter: filterOpt, start: startOpt, times: timesOpt, until: untilOpt } = options;
  /** True when the {@link GatedEffectOptions.start} condition is met.  This is initially true if the {@link GatedEffectOptions.start} condition is undefined. */
  let startConditionMet = startOpt === undefined;
  const hasFilter = filterOpt !== undefined;
  const hasUntil = untilOpt !== undefined;
  const effectRef = effect((onCleanup) => {
    if (!startConditionMet) {
      // if the condition is not met, do not run the effect.
      if (!(startOpt as () => boolean)()) {
        return;
      }
      startConditionMet = true;
    }
    if (hasFilter && !filterOpt()) {
      // prevent from running if the filter is not met.
      return; 
    }
    if (timesOpt !== undefined) {
      // if times run condition is met, then destroy the effect and return.
      if (timesRun >= timesOpt) {
        effectRef.destroy();
        return;
      }
      timesRun += 1;
    }
    if (hasUntil && untracked(() => untilOpt())) {
      // if until condition is met, then destroy the effect and return.
      // there is no point in untilOpt to be tracked - any signals inside of the effectFn will trigger the effect and until must run before it.
      effectRef.destroy();
      return;
    }
    effectFn(onCleanup);
  }, options);

  return effectRef;
}
