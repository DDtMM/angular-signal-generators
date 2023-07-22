/** The status of the timer. */
export enum TimerStatus { Destroyed, Paused, Running, Stopped };

/** Options for the timer */
export interface TimerInternalOptions {
  /** Callback to call when timer ticks. */
  callback?: (tickCount: number) => void;
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
    return this.intervalRunner!.dueTime;
  }
  set intervalTime(value: number) {
    TimerInternal.assertHasIntervalRunner(this);
    this.updateRunnerDueTime(value, this.intervalRunner!);
  }

  /** Gets the number of ticks since start. */
  get ticks(): number { return this.tickCount; }

  /** Gets or sets the timeoutTime. */
  get timeoutTime() { return this.timeoutRunner.dueTime; }
  set timeoutTime(value: number) { this.updateRunnerDueTime(value, this.timeoutRunner); }

  /** Readonly status of the timer. */
  get timerStatus() { return this.status; }

  /** Called when the timer completes. */
  private readonly callback: (tickCount: number) => void;
  /** The runner that is used in intervalMode */
  private readonly intervalRunner?: TimerInternalRunner;
  /** The time the last tick completed.  Doesn't have to be the actual last time. */
  private lastCompleteTime = Date.now();
  /** When paused, stores what time was remaining. */
  private remainingTimeAtPause = 0;
  /** The currently active runner.  Initially timeout, and then switches to interval. */
  private runner: TimerInternalRunner;
  /** The current status of timer. */
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
    this.callback = options?.callback ?? (() => {});
    if (options?.runAtStart) {
      this.status = TimerStatus.Running;
      this.tickStart();
    }
  }

  /** Clears the current tick and prevents any future processing. */
  destroy(): void {
    clearTimeout(this.timeoutId);
    this.status = TimerStatus.Destroyed;
  }

  /** Pauses the timer. */
  pause(): void {
    if (this.status === TimerStatus.Running) {
      this.remainingTimeAtPause = this.getRemainingTime();
      clearTimeout(this.timeoutId);
      this.status = TimerStatus.Paused;
    }
  }

  /** Resumes the timer if it was paused, otherwise does nothing. */
  resume(): void {
    if (this.status === TimerStatus.Paused) {
      this.status = TimerStatus.Running;
      // if duration is adjusted by a signal then this is a problem.
      this.lastCompleteTime = Date.now() - (this.runner.dueTime - this.remainingTimeAtPause);
      this.tickStart();
    }
  }

  /** Start or restarts the timer as long as it isn't destroyed. */
  start(): void {
    if (this.status !== TimerStatus.Destroyed) {
      this.status = TimerStatus.Running;
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
      this.status = TimerStatus.Stopped;
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
    if (remainingTime > 0) {
      this.tickStart();
    }
    else {

      ++this.tickCount;
      this.callback(this.tickCount);
      this.lastCompleteTime = Date.now() + this.getRemainingTime();
      this.runner.onTickComplete();
    }
  }

  /** Attempts to starts the tick timeout. */
  private tickStart(): void {
    clearTimeout(this.timeoutId);
    if (this.status === TimerStatus.Running) {
      this.timeoutId = setTimeout(this.tickComplete.bind(this), this.getRemainingTime());
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
