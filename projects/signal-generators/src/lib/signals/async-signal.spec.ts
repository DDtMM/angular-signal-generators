import { Injector, signal } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { BehaviorSubject, finalize, Observable, of, startWith, Subject, tap, timer } from 'rxjs';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { asyncSignal } from './async-signal';

describe('asyncSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  setupTypeGuardTests(() => asyncSignal(Promise.resolve(1), { injector }));

  describe('for computed and effects', () => {
    setupComputedAndEffectTests(
      () => {
        const sut = asyncSignal(Promise.resolve(1), { injector });
        return [sut, () => sut.set(Promise.resolve(2))];
      },
      'from a value'
    );
    setupComputedAndEffectTests(
      () => {
        const source = signal(Promise.resolve(1));
        const sut = asyncSignal(source, { injector });
        return [sut, () => source.set(Promise.resolve(2))];
      },
      'from a signal'
    );
    // setupDoesNotCauseReevaluationsSimplyWhenNested can not be tested because nesting this signal will cause an error.
  });

  // This shouldn't be any different if passed a signal, value, or async object.
  it('can be created without options', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => asyncSignal(Promise.resolve(1)));
    expect(sut()).toBe(undefined);
    tick();
    expect(sut()).toBe(1);
  }));

  describe('from a value', () => {
    it('returns a signal that can be set', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, asyncSignal(Promise.resolve(1), { injector }));
      sut.set(Promise.resolve(2));
      tick();
      expect(sut()).toBe(2);
    }));
    it('returns a signal with readonly method', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, asyncSignal(Promise.resolve(1), { injector }));
      sut.set(Promise.resolve(2));
      tick();
      expect(sut.asReadonly()()).toBe(2);
    }));
    it('returns a signal that can be updated', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, asyncSignal(Promise.resolve(1), { injector }));
      sut.update((x) => (x instanceof Promise ? Promise.resolve(2) : Promise.resolve(0)));
      tick();
      expect(sut()).toBe(2);
    }));

    it('uses equal function', () => {
      const asyncSource = new BehaviorSubject(2)
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector, defaultValue: 1, equal: (a, b) => a % 2 === b % 2 }));
      TestBed.flushEffects();
      expect(sut()).toBe(2);
      asyncSource.next(4);
      expect(sut()).toBe(2);
      asyncSource.next(5);
      expect(sut()).toBe(5);
    });

  });

  describe('from a signalInput', () => {
    it('updates output from a signal', fakeAsync(() => {
      const source = autoDetectChangesSignal(fixture, signal(Promise.resolve(1)));
      const sut = asyncSignal(source, { injector });
      source.set(Promise.resolve(2));
      tick();
      expect(sut()).toBe(2);
    }));

    it('updates output from a value that needs coercing', fakeAsync(() => {
      const source = autoDetectChangesSignal(fixture, signal(Promise.resolve(1)));
      const sut = asyncSignal(() => source(), { injector });
      source.set(Promise.resolve(2));
      tick();
      expect(sut()).toBe(2);
    }));

  });

  describe('from a function that is not a signal', () => {
    it('does not throw if using a variable defined after it is created', () => {
      /*
      * In classes a variable can be defined after the signal is created.
      * If the variable is initially retrieved then this should throw an error.
      * So initially the value of the signal should be the default value.
      */
      // eslint-disable-next-line prefer-const
      let innerSubject: BehaviorSubject<number>;
      const sut = autoDetectChangesSignal(fixture, asyncSignal(() => innerSubject, { defaultValue: -1, injector }));
      innerSubject = new BehaviorSubject(1);
      TestBed.flushEffects();
      expect(sut()).toBe(1);
    });
  })
  describe('general execution', () => {
    it('creates a signal that initially returns defaultValue if provided in options', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, asyncSignal(Promise.resolve(1), { defaultValue: -1, injector }));
      expect(sut()).toBe(-1);
      tick();
      expect(sut()).toBe(1);
    }));

    it('create a new subscription when source changes', () => {
      const source1 = new BehaviorSubject(1);
      const source2 = new BehaviorSubject(5);
      const subscribeSpy1 = spyOn(source1, 'subscribe').and.callThrough();
      const subscribeSpy2 = spyOn(source2, 'subscribe').and.callThrough();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(source1, { defaultValue: -1, injector }));
      TestBed.flushEffects();
      expect(sut()).toBe(1);
      source1.next(2);
      expect(sut()).toBe(2);
      sut.set(source2);
      expect(subscribeSpy1).toHaveBeenCalledTimes(1);
      expect(subscribeSpy2).toHaveBeenCalledTimes(1);
      expect(sut()).toBe(5);
    });

    it('ignores output from a prior async source value when another one is active', () => {
      const subjectOne = new BehaviorSubject(1);
      const subjectTwo = new BehaviorSubject(6);
      const sut = autoDetectChangesSignal(fixture, asyncSignal(subjectOne, { injector }));
      TestBed.flushEffects();
      expect(sut()).toBe(1);
      sut.set(subjectTwo);
      expect(sut()).toBe(6);
      subjectOne.next(2);
      expect(sut()).toBe(6);
      subjectTwo.next(7);
      expect(sut()).toBe(7);
    });

    it('updates if a signal is used inside of the "auto-computed" overload.', fakeAsync(() => {
      function fakeFetch(idValue: number): Promise<number> {
        return Promise.resolve(idValue + 1);
      }
      const $id = autoDetectChangesSignal(fixture, signal(1));
      const sut = autoDetectChangesSignal(fixture, asyncSignal(() => fakeFetch($id()), { injector }));
      fixture.detectChanges(); // ensure compute runs
      tick(); // get promise to resolve
      expect(sut()).toBe(2);
      $id.set(5);
      expect(sut()).toBe(2);
      flush(); // get promise to resolve
      expect(sut()).toBe(6);
    }));

    it('cleans up when switch sources', () => {
      const sourceOne = new BehaviorSubject(1);
      const sourceTwo = new BehaviorSubject(2);
      const unsubscribeSpy = spyOnUnsubscribeFromObservableSubscribe(sourceOne);
      const sut = autoDetectChangesSignal(fixture, asyncSignal(sourceOne, { injector }));
      sut();
      TestBed.flushEffects();
      expect(unsubscribeSpy!).toHaveBeenCalledTimes(0);
      sut.set(sourceTwo);
      expect(unsubscribeSpy!).toHaveBeenCalledTimes(1);
    });

    it('cleans up when destroyed', () => {
      const source = new BehaviorSubject(1);
      const unsubscribeSpy = spyOnUnsubscribeFromObservableSubscribe(source);
      const sut = autoDetectChangesSignal(fixture, asyncSignal(source, { injector }));
      sut();
      TestBed.flushEffects();
      expect(unsubscribeSpy!).toHaveBeenCalledTimes(0);
      fixture.destroy();
      expect(unsubscribeSpy!).toHaveBeenCalledTimes(1);
    });
  });

  describe('when requireSync is true', () => {
    it('does not resubscribe to an async if the same source is passed again', () => {
      const source = new BehaviorSubject(1);
      const subscribeSpy = spyOn(source, 'subscribe').and.callThrough();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(source, { injector, requireSync: true }));
      expect(sut()).toBe(1);
      source.next(2);
      expect(sut()).toBe(2);
      sut.set(source);
      expect(subscribeSpy).toHaveBeenCalledTimes(1);
      expect(sut()).toBe(2);
    });

    it('throws if there has been no emission', () => {
      const source = new Subject<number>();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(source, { injector, requireSync: true }));
      expect(() => sut()).toThrowError('requireSync is true, but no value was returned from asynchronous source.');
    });
  })
  describe('async errors', () => {
    it('throws when subscribable async source throws', fakeAsync(() => {
      const obs$ = timer(1000).pipe(
        tap(() => { throw new Error(); }),
        startWith(6)
      );
      const sut = autoDetectChangesSignal(fixture, asyncSignal(obs$, { injector }));
      flush();
      expect(sut()).toBe(6);
      tick(1000); // get observable to throw error.
      expect(() => sut()).toThrowError();
    }));

    it('throws when PromiseLike async source is rejected', fakeAsync(() => {
      const asyncSource = createPromiseWithResolvers<number>();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector }));
      expect(sut()).toBe(undefined);
      asyncSource.reject();
      flush(); // need to process the reject.
      expect(() => sut()).toThrowError();
    }));

    it('will not update after an error has been thrown', fakeAsync(() => {
      const asyncSource = createPromiseWithResolvers<number>();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector }));
      asyncSource.reject();
      flush();
      expect(() => sut()).toThrowError('Error in Async Source'); // initial error.
      sut.set(Promise.resolve(5)); // event though this is a good promise, the error should still be present.
      flush();
      expect(() => sut()).toThrowError('Error in Async Source'); // still errored.
    }));

    it('will run cleanup and continue to throw if the state is errored but source changes.', fakeAsync(() => {
      let isCleanedUp = false;
      const obs$ = timer(250, 250).pipe(
        tap((i) => {
          if (i === 1) {
            throw new Error();
          }
        }),
        finalize(() => isCleanedUp = true)
      );
      const sut = autoDetectChangesSignal(fixture, asyncSignal(obs$, { injector }));
      tick(250);
      expect(isCleanedUp).toBe(false);
      tick(250); // get observable to throw error.
      expect(isCleanedUp).toBe(true);
      expect(() => sut()).toThrowError();
      sut.set(of(5));
      tick(2000);
      expect(() => sut()).toThrowError();
    }));

    it('will not create a new error after an error has been thrown from a source', fakeAsync(() => {
      const asyncSource = createPromiseWithResolvers<number>();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector }));
      asyncSource.reject('error1');
      flush();
      sut.set(Promise.reject('error2'));
      flush();
      expect(() => sut()).toThrowMatching((x) => (x as Error).cause === 'error1');
    }));
  });
});

/** There will be a native version of this soon. */
type PromiseWithResolvers<T> = Promise<T> & { resolve: (value: T) => void, reject: (reason?: unknown) => void };
/** Creates a promise that can be resolved or rejected externally.  There will be a native version soon */
function createPromiseWithResolvers<T>(): PromiseWithResolvers<T> {
  let resolve: (value: T) => void = () => {};
  let reject: (reason?: unknown) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  }) as PromiseWithResolvers<T>;
  promise.reject = reject;
  promise.resolve = resolve;
  return promise;
}

/**
 * Returns a spy on the unsubscribe function returned from ANY call to subscribe.
 * So if multiple subscriptions are created, they will all have the same spy returned from this method.
 */
function spyOnUnsubscribeFromObservableSubscribe<T>(obs$: Observable<T>): jasmine.Spy {
  const unsubscribeSpy = jasmine.createSpy('unsubscribe', () => {});

  obs$.subscribe = (observer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = Observable.prototype.subscribe.apply(obs$, [observer as any]);
    const originalUnsubscribe = subscription.unsubscribe;
    subscription.unsubscribe = () => {
      originalUnsubscribe.call(subscription);
      unsubscribeSpy();
    }
    return subscription;
  }

  return unsubscribeSpy;
}
