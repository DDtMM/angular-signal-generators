import { Injector, Signal, effect, signal } from '@angular/core';
import { SignalInput, coerceSignal } from '../internal/signal-coercion';
import { getDestroyRef } from '../internal/utilities';

interface DurationGetter {
  get duration(): number;
}

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
 * @param timerTime A constant or {@link SignalInput} that emits how long until the timer is due.
 * @param intervalTime An optional constant or {@link SignalInput} that emits how long until the timer is due after the initial time was emitted.
 * @param options An optional object that affects behavior of the signal.
 */
export function timerSignal(timerTime: TimeSource,  intervalTime?: TimeSource, options?: TimerSignalOptions): TimerSignal {
  /** Tracks the time the signal last emitted.  Can be overwritten if the last time needs to be faked. */
  let lastCompleteTime = Date.now();

  /** The signal that will be returned. */
  const output = signal(0);

  /** When paused, tracks the time still remaining. */
  let remainingTimeAtPause = 0;

  /** The current status of timer.  Starts as running because this is a signal and has to emit initially. */
  let status = TimerState.Running;

  /** The id from the last call of setTimeout. */
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  /** Function to be called after a timer has been completed. */
  let timeoutComplete: () => void;

  /** Timer duration is set from timerTime param */
  const timerDurationGetter = durationGetterFactory(timerTime);

  /** If an interval duration was passed then it has to be initialized at the start. */
  const intervalDurationGetter = intervalTime !== undefined ? durationGetterFactory(intervalTime) : undefined;

  /** Initially this is the timerDuration source, and can switch to interval timer source. */
  let durationGetter: DurationGetter;

  // the timer will automatically start if a time Source was a signal because of the effect,
  // but if the initial time wasn't a signal it needs to start.
  switchToTimerMode();

  // setup cleanup actions.
  getDestroyRef(timerSignal, options?.injector).onDestroy(destroy);

  // return timer signal
  return createTimerSignal(output);

  /** Clears the last timeout and sets the state as destroyed. */
  function destroy(): void {
    clearTimeout(timeoutId);
    status = TimerState.Destroyed;
  }

  /** Assigns timer functions to the signal. */
  function createTimerSignal(sourceSignal: Signal<number>): TimerSignal {
    return Object.assign(sourceSignal, {
      pause: pause.bind(sourceSignal),
      restart: restart.bind(sourceSignal),
      resume: resume.bind(sourceSignal)
    });
  }

  /** Converts timeSource into a durationGetter and sets up what's necessary if duration comes from a signal. */
  function durationGetterFactory(timeSource: TimeSource): DurationGetter {
    if (typeof timeSource === 'number') {
      return { duration: timeSource };
    }
    else {
      const durationSignal = coerceSignal(timeSource, { injector: options?.injector });
      effect(() => {
        // timer needs to update every time durationSignal changes.
        // instead of restarting the timer we could keep track if this is an increase and therefore there is no need to start the timer.
        timerStart();
        durationSignal();
      }, options);
      return {
        get duration(): number { return durationSignal(); }
      };
    }
  }

  /** Retrieves the remaining time from durationSource */
  function getRemainingTime(): number {
    return durationGetter.duration - (Date.now() - lastCompleteTime);
  }

  /** Pauses the timer. */
  function pause(): void {
    if (status === TimerState.Running) {
      remainingTimeAtPause = getRemainingTime();
      clearTimeout(timeoutId);
      status = TimerState.Paused;
    }
  }

  /** Restarts the timer as long as it isn't destroyed. */
  function restart(): void {
    if (status !== TimerState.Destroyed) {
      status = TimerState.Running;
      lastCompleteTime = Date.now();
      output.set(0);
      switchToTimerMode();
    }
  }

  /** Resumes the timer if it was paused, otherwise does nothing. */
  function resume(): void {
    if (status === TimerState.Paused) {
      status = TimerState.Running;
      lastCompleteTime = Date.now() - (durationGetter.duration - remainingTimeAtPause); // if duration is adjusted by a signal then this is a problem.
      timerStart();
    }
  }

  /** Switcher to timer mode, replacing timeoutComplete and durationGetter */
  function switchToTimerMode() {
    timeoutComplete = timeoutTimerComplete;
    durationGetter = timerDurationGetter; // return to the original duration getter.
    timerStart();
  }

  /** Either switches to interval mode by replacing timeoutComplete and durationGetter or if there is no intervalMode, completes. */
  function switchToIntervalMode() {
    if (intervalDurationGetter !== undefined) {
      timeoutComplete = timeoutIntervalComplete;
      durationGetter = intervalDurationGetter;
      timerStart();
    }
    else {
      status = TimerState.Completed;
    }
  }

  /** Once in interval mode, use this simpler complete function */
  function timeoutIntervalComplete(): void {
    const remainingTime = getRemainingTime();
    if (remainingTime <= 0) {
      lastCompleteTime = Date.now() + remainingTime;
      output.update(x => x + 1);
    }
    timerStart();
  }

  /** This is the initial timer complete function which will switch to interval mode. */
  function timeoutTimerComplete(): void {
    const remainingTime = getRemainingTime();
    if (remainingTime <= 0) {
      lastCompleteTime = Date.now() + remainingTime;
      output.update(x => x + 1);
      switchToIntervalMode()
    }
  }

  /** Clearing the old timer and starts a new one if in proper state. */
  function timerStart(): void {
    clearTimeout(timeoutId);
    if (status === TimerState.Running) {
      timeoutId = setTimeout(timeoutComplete, getRemainingTime());
    }
  }
}

