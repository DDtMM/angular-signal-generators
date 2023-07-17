import { Injector, Signal, effect, signal } from '@angular/core';
import { SignalInput, coerceSignal } from '../internal/signal-coercion';
import { getDestroyRef } from '../internal/utilities';

export interface TimerSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

export type TimeSource = number | SignalInput<number>;

enum TimerState { Completed, Destroyed, Paused, Running };

/** A readonly signal with methods to affect execution */
export interface TimerSignal extends Signal<number> {
  /** Pauses the timer. */
  pause(): void;
  /** Restarts the timer if it is an interval, or incomplete "one-time" timer. */
  restart(): void;
  /** Resumes the timer if paused using the remaining time when paused. */
  resume(): void;
}
/**
 * Creates a signal that acts either a timer or interval.
 * Emitting increasing numbers for each iteration, starting with an initial 0.
 * Using a {@link SignalInput} as a parameter will cause the timer to immediately emit if it is reduced to an amount that would
 * move due time into the past.
 * @example
 * ```ts
 * const dueInASecond = timerSignal(1000);
 * const dueEverySecond = timerSignal(1000, 1000);
 * const dueTime = computed(() => 500 + dueEverySecond() * 50);
 * const adjustableDueTime = timerSignal(dueTime, dueTime);
 *
 * effect(() => console.log('due in a second', dueInASecond()));
 * effect(() => console.log('due every second', dueEverySecond()));
 * effect(() => console.log('due every second', adjustableDueTime()));
 * ```
 * @param initialTime A constant or {@link SignalInput} that emits how long until the timer is due.
 * @param intervalTime An optional constant or {@link SignalInput} that emits how long until the timer is due after the initial time was emitted.
 * @param options An optional object that affects behavior of the signal.
 */
export function timerSignal(initialTime: TimeSource,
  intervalTime?: TimeSource, options?: TimerSignalOptions): TimerSignal {

  const destroyRef = getDestroyRef(timerSignal, options?.injector);

  /** Retrieves the remaining time from durationSource */

  let lastCompleteTime = performance.now();
  const output = signal(0);
  let remainingTimeAtPause = 0;
  let status = TimerState.Running;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  /** Function to be called after a timer has been completed. */
  let timerComplete: () => void = timerInitialComplete;

  let currentDurationSource = durationSourceFactory(initialTime);
  // the interval duration has to be initialized at the start.
  const intervalDurationSource = intervalTime !== undefined ? durationSourceFactory(intervalTime) : undefined;

  destroyRef.onDestroy(destroy);

  return Object.assign(output, {
    pause: pause.bind(output),
    restart: restart.bind(output),
    resume: resume.bind(output)
  });

  function destroy(): void {
    clearTimeout(timeoutId);
    status = TimerState.Destroyed;
  }

  function getRemainingTime(): number {
    return currentDurationSource.duration - (performance.now() - lastCompleteTime);
  }

  /** Pauses the timer. */
  function pause(): void {
    if (status === TimerState.Running) {
      remainingTimeAtPause = getRemainingTime();
      clearTimeout(timeoutId);
      status = TimerState.Paused;
    }
  }

  /** Restarts the timer. */
  function restart(): void {
    if (status !== TimerState.Destroyed) {
      status = TimerState.Running;
      lastCompleteTime = performance.now();
      timerStart();
    }
  }

  /** Resumes the timer if it was paused, otherwise does nothing. */
  function resume(): void {
    if (status === TimerState.Paused) {
      status = TimerState.Running;
      lastCompleteTime = performance.now() - remainingTimeAtPause;
      timerStart();
    }
  }

  /** Once in interval mode, use this simpler complete function */
  function timerIntervalComplete(): void {
    const remainingTime = getRemainingTime();
    if (remainingTime <= 0) {
      lastCompleteTime = performance.now() + remainingTime;
      output.update(x => x + 1);
    }
    timerStart();
  }

  /** This is the initial timer complete function which will switch to interval mode. */
  function timerInitialComplete(): void {
    console.log('initial complete');
    const remainingTime = getRemainingTime();
    console.log(remainingTime);
    if (remainingTime <= 0) {
      lastCompleteTime = performance.now() + remainingTime;
      timerComplete = timerIntervalComplete;
      output.update(x => x + 1);
      // switch from to interval duration or complete.
      if (intervalDurationSource !== undefined) {
        currentDurationSource = intervalDurationSource;
        timerStart();
      }
      else {
        status = TimerState.Completed;
      }
    }
    else {
      // this could happen if this signal
      timerStart();
    }
  }

  /** Clearing the old timer and starts a new one if in proper state. */
  function timerStart(): void {
    clearTimeout(timeoutId);
    if (status === TimerState.Running) {
      timeoutId = setTimeout(timerComplete, getRemainingTime());
    }
  }

  interface DurationSource {
    get duration(): number;
  }

  function durationSourceFactory(timeSource: TimeSource): DurationSource {
    if (typeof timeSource === 'number') {
      return { duration: timeSource };
    }
    else {
      const durationSignal = coerceSignal(timeSource);
      effect(() => {
        // timer needs to update every time durationSignal changes.
        // instead of restarting the timer we could keep track if this is an increase and therefore there is no need to start the timer.
        timerStart();
        durationSignal();
      });
      return {
        get duration(): number { return durationSignal(); }
      };
    }
  }
}

