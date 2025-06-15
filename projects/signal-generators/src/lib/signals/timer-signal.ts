import { isPlatformBrowser } from '@angular/common';
import { CreateSignalOptions, Injector, PLATFORM_ID, Signal, WritableSignal, signal } from '@angular/core';
import { TimerInternal, TimerStatus } from '../internal/timer-internal';
import { getDestroyRef, getInjector } from '../internal/utilities';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

/** The state of the timer. */
export type TimerSignalStatus = 'running' | 'paused' | 'stopped' | 'destroyed';

/** Options for {@link timerSignal}. */
export interface TimerSignalOptions<T = number> extends Pick<CreateSignalOptions<T>, 'debugName'> {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
  /**
   * If true, the timer isn't running at start.
   * When running in a non-browser environment, the signal always begins in a stopped state by default.
   */
  stopped?: boolean;
  /**
   * A selector function that receives the tick count and returns the value to emit from the signal.
   * If not provided, the tick count (number) is emitted.
   */
  selector?: (tickCount: number) => T;
}

/** A readonly signal with methods to affect execution created from {@link timerSignal}. */
export interface TimerSignal<T = number> extends Signal<T> {
  /** Pauses the timer. */
  pause(): void;
  /** Restarts the timer if it is an interval, or incomplete "one-time" timer. */
  restart(): void;
  /** Resumes the timer if paused using the remaining time when paused. */
  resume(): void;
  /** The status of the timer as a signal. */
  state: Signal<TimerSignalStatus>;
}

// Overload for selector option
export function timerSignal<T>(
  timerTime: ValueSource<number>,
  intervalTime: ValueSource<number> | null | undefined,
  options: TimerSignalOptions<T> & { selector: (tickCount: number) => T }
): TimerSignal<T>;
// Default overload (no selector)
export function timerSignal(
  timerTime: ValueSource<number>,
  intervalTime?: ValueSource<number> | null,
  options?: TimerSignalOptions
): TimerSignal<number>;

export function timerSignal<T = number>(
  timerTime: ValueSource<number>,
  intervalTime?: ValueSource<number> | null,
  options?: TimerSignalOptions<T>
): TimerSignal<T> {
  const injector = options?.injector ?? getInjector(timerSignal);
  const timerTimeFn = createGetValueFn(timerTime, injector);
  const intervalTimeFn = intervalTime != null ? createGetValueFn(intervalTime, injector) : undefined;
  const selector = options?.selector ?? ((tickCount: number) => tickCount as unknown as T);
  /** The signal that will be returned. */
  const $output = signal<T>(selector(0), options);
  /** Keeps track of the state of the timer. */
  const $state = signal<TimerSignalStatus>('stopped');
  const timer = new TimerInternal(timerTimeFn(), intervalTimeFn?.(), {
    onStatusChange: (internalStatus) => $state.set(transformTimerStatus(internalStatus)),
    onTick: (x) => $output.set(selector(x)),
    runAtStart: !options?.stopped && isPlatformBrowser(injector.get(PLATFORM_ID))
  });
  // setup cleanup actions.
  getDestroyRef(timerSignal, options?.injector).onDestroy(() => timer.destroy());
  // watch for changes to update timer properties.
  watchValueSourceFn(timerTimeFn, (x) => timer.timeoutTime = x, injector);
  watchValueSourceFn(intervalTimeFn, (x) => timer.intervalTime = x, injector);
  // bind timer functions to output.
  return createTimerSignal($output, timer);

  /** Assigns timer functions to the signal. */
  function createTimerSignal(outputSignalFn: WritableSignal<T> & Partial<TimerSignal<T>>, timer: TimerInternal): TimerSignal<T> {
    outputSignalFn.pause = timer.pause.bind(timer);
    outputSignalFn.restart = () => {
      outputSignalFn.set(selector(0));
      timer.start();
    };
    outputSignalFn.resume = timer.resume.bind(timer);
    outputSignalFn.state = $state;
    return outputSignalFn as TimerSignal<T>;
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

