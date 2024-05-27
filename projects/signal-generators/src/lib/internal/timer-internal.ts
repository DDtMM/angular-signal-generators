/** The status of the timer. */
export enum TimerStatus { Destroyed, Paused, Running, Stopped }

/** Options for the timer */
export interface TimerInternalOptions {
  /** Callback to when status changes */
  onStatusChange?: (status: TimerStatus) => void;
  /** Callback to call when timer ticks. */
  onTick?: (tickCount: number) => void;
  /** If true, will immediately start time. */
  runAtStart?: boolean;
}

/** Unique properties for the mode the timer is in. */
interface TimerInternalRunner {
  onTickComplete: () => void;
  dueTime: number;
}

/** A general timer. */
export class TimerInternal {
  /** Gets or set intervalTime if this was started with an interval.  Will throw if not initially passed an interval. */
  get intervalTime() {
    TimerInternal.assertHasIntervalRunner(this);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.intervalRunner!.dueTime;
  }
  set intervalTime(value: number) {
    TimerInternal.assertHasIntervalRunner(this);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.updateRunnerDueTime(value, this.intervalRunner!);
  }

  /** Gets the number of ticks since start. */
  get ticks(): number { return this.tickCount; }

  /** Gets or sets the timeoutTime. */
  get timeoutTime() { return this.timeoutRunner.dueTime; }
  set timeoutTime(value: number) { this.updateRunnerDueTime(value, this.timeoutRunner); }

  /** Readonly status of the timer. */
  get timerStatus() { return this.status; }

  /** The runner that is used in intervalMode */
  private readonly intervalRunner?: TimerInternalRunner;
  /** The time the last tick completed.  Doesn't have to be the actual last time. */
  private lastCompleteTime = Date.now();
  /** Called when the status changes. */
  private readonly onStatusChangeCallback: (status: TimerStatus) => void;
  /** Called when the timer completes. */
  private readonly onTickCallback: (tickCount: number) => void;
  /** When paused, stores what time was remaining. */
  private remainingTimeAtPause = 0;
  /** The currently active runner.  Initially timeout, and then switches to interval. */
  private runner: TimerInternalRunner;
  /** The current status of timer.  Do not modify directly!  All changes should go through setStatus. */
  private status = TimerStatus.Stopped;
  /** The runner that is used in timeout mode. */
  private readonly timeoutRunner: TimerInternalRunner;
  /** The count of ticks */
  private tickCount = 0;
  /** The id of the last timeout. */
  private timeoutId?: ReturnType<typeof setTimeout>;

  /**
   * passing only timeoutTime will have this behave like a timeout.
   * passing intervalTime will have this first execute timeoutTime then intervalTime.
   */
  constructor(
    timeoutTime: number,
    intervalTime?: number,
    options?: TimerInternalOptions) {

    this.runner = this.timeoutRunner = {
      dueTime: timeoutTime,
      onTickComplete: this.onTimeoutTickComplete.bind(this)
    };

    if (intervalTime !== undefined) {
      this.intervalRunner = {
        dueTime: intervalTime,
        onTickComplete: this.tickStart.bind(this)// loop
      };
    }

    this.onTickCallback = options?.onTick ?? (() => undefined);
    this.onStatusChangeCallback = options?.onStatusChange ?? (() => undefined);

    if (options?.runAtStart) {
      this.setStatus(TimerStatus.Running);
      this.tickStart();
    }
  }

  /** Clears the current tick and prevents any future processing. */
  destroy(): void {
    clearTimeout(this.timeoutId);
    this.setStatus(TimerStatus.Destroyed);
  }

  /** Pauses the timer. */
  pause(): void {
    if (this.status === TimerStatus.Running) {
      this.remainingTimeAtPause = this.getRemainingTime();
      clearTimeout(this.timeoutId);
      this.setStatus(TimerStatus.Paused);
    }
  }

  /** Resumes the timer if it was paused, otherwise does nothing. */
  resume(): void {
    if (this.status === TimerStatus.Paused) {
      this.setStatus(TimerStatus.Running);
      // if duration is adjusted by a signal then this is a problem.
      this.lastCompleteTime = Date.now() - (this.runner.dueTime - this.remainingTimeAtPause);
      this.tickStart();
    }
  }

  /** Start or restarts the timer as long as it isn't destroyed. */
  start(): void {
    if (this.status !== TimerStatus.Destroyed) {
      this.setStatus(TimerStatus.Running);
      this.tickCount = 0;
      this.runner = this.timeoutRunner;
      this.lastCompleteTime = Date.now();
      this.tickStart();
    }
  }

  /** Throws if intervalRunner isn't defined. */
  private static assertHasIntervalRunner(ti: TimerInternal): boolean {
    if (!ti.intervalRunner) {
      throw new Error('This timer was not configured for intervals');
    }
    return true;
  }

  /** Determines the remaining time. */
  private getRemainingTime(): number {
    return this.runner.dueTime - (Date.now() - this.lastCompleteTime);
  }

  /** Switch to intervalRunner or set as stopped. */
  private onTimeoutTickComplete(): void {
    if (this.intervalRunner) {
      this.runner = this.intervalRunner;
      this.tickStart(); // begin intervalLoop
    }
    else {
      this.setStatus(TimerStatus.Stopped);
    }
  }

  private setStatus(status: TimerStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.onStatusChangeCallback(status);
    }
  }

  /**
   * Handles when a tick is complete.
   * If for some reason there is remaining time, it will restart the tick.
   * Otherwise it will increase the internalCount, execute the callback, update the completed,
   *   and call the current runner's onTickComplete method so that it handles the next step.
   */
  private tickComplete(): void {
    const remainingTime = this.getRemainingTime();
    if (remainingTime > 0) {  // this could occur if the end time changed.
      this.tickStart();
    }
    else {
      ++this.tickCount;
      this.onTickCallback(this.tickCount);
      this.lastCompleteTime = Date.now() + this.getRemainingTime();
      this.runner.onTickComplete();
    }
  }

  /** Attempts to starts the tick timeout. */
  private tickStart(): void {
    clearTimeout(this.timeoutId);
    if (this.status === TimerStatus.Running) {
      // This is dangerous if remainingTime is always calculated as a value less than 0 as it will create an infinite loop.
      //
      const remainingTime = this.getRemainingTime();
      if (remainingTime > 0) {
        this.timeoutId = setTimeout(this.tickComplete.bind(this), remainingTime);
      }
      else {
        this.tickComplete();
      }
    }
  }

  /** Sets the dueTime on the runner and if necessary starts the timer. */
  private updateRunnerDueTime(dueTime: number, targetRunner: TimerInternalRunner): void {
    const oldTime = targetRunner.dueTime;
    targetRunner.dueTime = dueTime;
    if (targetRunner === this.runner && this.status === TimerStatus.Running && oldTime > dueTime) {
      this.tickStart();
    }
  }
}
