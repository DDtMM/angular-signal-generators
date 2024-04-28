import { isPlatformBrowser } from '@angular/common';
import { Injector, PLATFORM_ID, Signal, WritableSignal, signal } from '@angular/core';
import { TimerInternal, TimerStatus } from '../internal/timer-internal';
import { getDestroyRef, getInjector } from '../internal/utilities';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

export type TimerSignalStatus = 'running' | 'paused' | 'stopped' | 'destroyed';

export interface TimerSignalOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
  /**
   * If true, the timer isn't running at start.
   * When running in a non-browser environment, the signal always begins in a stopped state by default.
   */
  stopped?: boolean;
}

/** A readonly signal with methods to affect execution */
export interface TimerSignal extends Signal<number> {
  /** Pauses the timer. */
  pause(): void;
  /** Restarts the timer if it is an interval, or incomplete "one-time" timer. */
  restart(): void;
  /** Resumes the timer if paused using the remaining time when paused. */
  resume(): void;
  /** The status of the timer as a signal. */
  state: Signal<TimerSignalStatus>;
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
export function timerSignal(timerTime: ValueSource<number>, intervalTime?: ValueSource<number> | null, options?: TimerSignalOptions): TimerSignal {
  // To make thinks easy to access values, make TimeSources functions.
  const injector = options?.injector ?? getInjector(timerSignal);
  const timerTimeFn = createGetValueFn(timerTime, injector);
  const intervalTimeFn = intervalTime != null ? createGetValueFn(intervalTime, injector) : undefined;
  /** The signal that will be returned. */
  const output = signal(0);
  const state = signal<TimerSignalStatus>('stopped');
  const timer = new TimerInternal(timerTimeFn(), intervalTimeFn?.(), {
    onStatusChange: (internalStatus) => state.set(transformTimerStatus(internalStatus)),
    onTick: (x) => output.set(x),
    runAtStart: !options?.stopped && isPlatformBrowser(injector.get(PLATFORM_ID))
  });
  // setup cleanup actions.
  getDestroyRef(timerSignal, options?.injector).onDestroy(() => timer.destroy());
  // watch for changes to update timer properties.
  watchValueSourceFn(timerTimeFn, (x) => timer.timeoutTime = x, injector);
  watchValueSourceFn(intervalTimeFn, (x) => timer.intervalTime = x, injector);
  // bind timer functions to output.
  return createTimerSignal(output, timer);

  /** Assigns timer functions to the signal. */
  function createTimerSignal(sourceSignal: WritableSignal<number>, timer: TimerInternal): TimerSignal {
    return Object.assign(sourceSignal, {
      pause: timer.pause.bind(timer),
      restart: () => {
        sourceSignal.set(0);
        timer.start();
      },
      resume: timer.resume.bind(timer),
      state
    });
  }

  function transformTimerStatus(status: TimerStatus): TimerSignalStatus {
    switch (status) {
      case TimerStatus.Destroyed: return 'destroyed';
      case TimerStatus.Running: return 'running';
      case TimerStatus.Paused: return 'paused';
      case TimerStatus.Stopped: return 'stopped';
    }
  }
}

