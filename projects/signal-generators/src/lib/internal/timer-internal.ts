enum TimerStatus { Destroyed, Paused, Running, Stopped };

interface TimerInternalOptions {
  runAtStart?: boolean;
}

interface TimerInternalRunner {
  onTickComplete: () => void;
  dueTime: number;
}

export class TimerInternal {

  status = TimerStatus.Stopped;

  /** Gets or set intervalTime if this was started with an interval.  Will throw if not initally passed an interval. */
  get intervalTime() { 
    TimerInternal.assertHasIntervalRunner(this);
    return this.intervalRunner!.dueTime;
  }
  set intervalTime(value: number) { 
    TimerInternal.assertHasIntervalRunner(this);
    this.updateRunnerDueTime(value, this.intervalRunner!); 
  }

  /** Gets or sets the timeoutTime. */
  get timeoutTime() { return this.timeoutRunner.dueTime; }
  set timeoutTime(value: number) { this.updateRunnerDueTime(value, this.timeoutRunner); }

  private internalCount = 0;
  private intervalRunner?: TimerInternalRunner;
  private lastCompleteTime = Date.now();
  private remainingTimeAtPause = 0;
  private runner: TimerInternalRunner;
  private readonly timeoutRunner: TimerInternalRunner;
  private timeoutId?: ReturnType<typeof setTimeout>;

  /**
   * passing only timeoutTime will have this behave like a timeout.
   * passing intervalTime will have this first execute timeoutTime then intervalTime.
   */
  constructor(private callback: (count: number) => void, 
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
      this.internalCount = 0;
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
      ++this.internalCount;
      this.callback(this.internalCount);
      this.lastCompleteTime = Date.now() + this.getRemainingTime();
      this.runner.onTickComplete();
    }
  }

  /** Attempts to starts the tick timeout. */
  private tickStart(): void {
    clearTimeout(this.timeoutId);
    if (this.status === TimerStatus.Running) {
      this.timeoutId = setTimeout(this.tickComplete.bind(this), this.runner.dueTime);
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
