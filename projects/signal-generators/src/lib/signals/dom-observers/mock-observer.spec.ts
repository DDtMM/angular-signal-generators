/**
 * An observer with all methods mocked.
 * @typeParam TObserved The observed target's type.
 * @typeParam TObserveOptions The options when adding an observed target.  Not all observers will use this.
 * @typeParam TInitOptions The options when creating the observer.  Not all observers will use this.
 * @typeParam TCallback The type of the function the observer should expect when an observation is made.
 * Will be called when simulateObservation is called.
 */
export class MockObserver<
  TObserved = unknown,
  TObserveOptions = unknown,
  TInitOptions = unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCallback extends (...args: any[]) => void = (...args: any[]) => void
> {
  /** The last created instance of a MockObserver. */
  static currentInstance?: MockObserver;

  disconnect = jasmine.createSpy('disconnect').and.callFake(() => (this.observed = []));
  observe = jasmine
    .createSpy('observe')
    .and.callFake((target: TObserved, options?: TObserveOptions) => this.observed.push([target, options]));
  /** Observed elements and their options. */
  observed: [TObserved, TObserveOptions | undefined][] = [];
  unobserve = jasmine
    .createSpy('unobserve')
    .and.callFake((target: TObserved) => (this.observed = this.observed.filter((x) => x !== target)));
  takeRecords = jasmine.createSpy('takeRecords');

  /** A realistic delay between a change and the observer creating a notification. */
  observationDelay = 250;
  /**
   * Create mock observer with optional callback.
   * @param callback If set, the callback will be called when simulateObservation is called.
   * @param initOptions Options to pass to the constructor.
   */
  constructor(public callback?: TCallback, public initOptions?: TInitOptions) {
    this.callback = callback;
    MockObserver.currentInstance = this;
  }

  /** Calls the callback passed to the constructor after a delay.  If nothing is observed then does nothing. */
  simulateObservation(response: Parameters<TCallback>[0]) {
    if (this.observed.filter(x => !!x).length !== 0) {
      setTimeout(() => this.callback?.(response, this), this.observationDelay);
    }
  }
}

/*
Using the actual observer implementations is troublesome.
For example, the browser window must have focus for ResizeObserver to work.
At some point we may have to resort to using these implementations below.
*/
export class MockMutationObserver extends MockObserver<Node, MutationObserverInit, void, MutationCallback> {
  /** The last created instance of a MockMutationObserver. */
  static override currentInstance?: MockMutationObserver;
  constructor(callback: MutationCallback) {
    super(callback);
    MockMutationObserver.currentInstance = this;
  }
}
export class MockResizeObserver extends MockObserver<Element, ResizeObserverOptions, void, ResizeObserverCallback> {
  /** The last created instance of a MockResizeObserver. */
  static override currentInstance?: MockResizeObserver;
  constructor(callback: ResizeObserverCallback) {
    super(callback);
    MockResizeObserver.currentInstance = this;
  }
}
export class MockIntersectionObserver extends MockObserver<
  Element,
  void,
  IntersectionObserverInit,
  IntersectionObserverCallback
> {
  /** The last created instance of a MockIntersectionObserver. */
  static override currentInstance?: MockIntersectionObserver;
  root: Document | Element | null = null;
  rootMargin = '0px 0px 0px 0px';
  thresholds: number[] = [0, 1];
  constructor(callback: IntersectionObserverCallback, initOptions?: IntersectionObserverInit) {
    super(callback, initOptions);
    this.root = this.initOptions?.root ?? this.root;
    this.rootMargin = this.initOptions?.rootMargin ?? this.rootMargin;
    this.thresholds =
      this.initOptions?.threshold != null
        ? typeof this.initOptions.threshold === 'number'
          ? [this.initOptions.threshold]
          : this.initOptions.threshold
        : this.thresholds;
    MockIntersectionObserver.currentInstance = this;
  }
}
