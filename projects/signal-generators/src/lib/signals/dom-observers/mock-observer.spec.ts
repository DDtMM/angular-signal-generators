/** An observer with all methods mocked. */
export class MockObserver<TObserved = unknown, TObserveOptions = unknown, TInitOptions = unknown, TCallback extends (...args: never[]) => void = () => void> {
  observed: [TObserved, TObserveOptions | undefined][] = [];

  disconnect = jasmine.createSpy('disconnect').and.callFake(() => this.observed = []);
  observe = jasmine.createSpy('observe').and.callFake((target: TObserved, options?: TObserveOptions) => this.observed.push([target, options]));
  unobserve = jasmine.createSpy('unobserve').and.callFake((target: TObserved) => this.observed = this.observed.filter(x => x !== target));
  takeRecords = jasmine.createSpy('takeRecords');
  observationDelay = 250;
  /**
   * Create mock observer with optional callback.
   * @param callback If set, the callback will be called when simulateObservation is called.
   * @param initOptions Options to pass to the constructor.
   */
  constructor(public callback?:TCallback, public initOptions?: TInitOptions) { }

  /** Calls the callback passed to the constructor after a delay.  If none were set then does nothing. */
  simulateObservation(...response: Parameters<TCallback>) {
    console.log('calling callback', response);
    this.callback?.call(this, ...response);
    //setTimeout(() => this.callback?.call(this, ...response), this.observationDelay);
  }
}

/*
Using the actual observer implementations is troublesome.
For example, the browser window must have focus for ResizeObserver to work.
At some point we may have to resort to using these implementations below.
*/
export class MockMutationObserver extends MockObserver<Node, MutationObserverInit, void, MutationCallback> {}
export class MockResizeObserver extends MockObserver<Element, ResizeObserverOptions, void, ResizeObserverCallback> {}
export class MockIntersectionObserver extends MockObserver<Element, void, IntersectionObserverInit, IntersectionObserverCallback> {
  root: Document | Element | null = null;
  rootMargin = '0px 0px 0px 0px';
  thresholds: number[] = [0, 1];
  constructor(callback: IntersectionObserverCallback, initOptions?: IntersectionObserverInit) {
    super(callback, initOptions);
    this.root = this.initOptions?.root ?? this.root;
    this.rootMargin = this.initOptions?.rootMargin ?? this.rootMargin;
    this.thresholds = this.initOptions?.threshold != null ?
      typeof this.initOptions.threshold === 'number' ? [this.initOptions.threshold] : this.initOptions.threshold : this.thresholds;
  }
}

