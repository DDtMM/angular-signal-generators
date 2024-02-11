import { Component, Injector, signal } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { BehaviorSubject, startWith, tap, timer } from 'rxjs';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
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
      null,
      'from a value'
    );
    setupComputedAndEffectTests(
      () => {
        const source = signal(Promise.resolve(1));
        const sut = asyncSignal(source, { injector });
        return [sut, () => source.set(Promise.resolve(2))];
      },
      null,
      'from a signal'
    );
  });

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

  describe('execution', () => {
    it('creates a signal that initially returns defaultValue if provided in options', fakeAsync(() => {
      const sut = autoDetectChangesSignal(fixture, asyncSignal(Promise.resolve(1), { defaultValue: -1, injector }));
      expect(sut()).toBe(-1);
      tick();
      expect(sut()).toBe(1);
    }));

    it('create a new subscription when source changes', fakeAsync(() => {
      const source1 = new BehaviorSubject(1);
      const source2 = new BehaviorSubject(5);
      const subscribeSpy1 = spyOn(source1, 'subscribe').and.callThrough();
      const subscribeSpy2 = spyOn(source2, 'subscribe').and.callThrough();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(source1, { defaultValue: -1, injector }));
      expect(sut()).toBe(1);
      source1.next(2);
      expect(sut()).toBe(2);
      sut.set(source2);
      expect(subscribeSpy1).toHaveBeenCalledTimes(1);
      expect(subscribeSpy2).toHaveBeenCalledTimes(1);
      expect(sut()).toBe(5);
    }));
    it('does not resubscribe to an async if the same source is passed again', fakeAsync(() => {
      const source = new BehaviorSubject(1);
      const subscribeSpy = spyOn(source, 'subscribe').and.callThrough();
      const sut = autoDetectChangesSignal(fixture, asyncSignal(source, { defaultValue: -1, injector }));
      expect(sut()).toBe(1);
      source.next(2);
      expect(sut()).toBe(2);
      sut.set(source);
      expect(subscribeSpy).toHaveBeenCalledTimes(1);
      expect(sut()).toBe(2);
    }));
    it('ignores output from a prior async source value when another one is active', fakeAsync(() => {
      const subjectOne = new BehaviorSubject(1);
      const subjectTwo = new BehaviorSubject(6);
      const sut = autoDetectChangesSignal(fixture, asyncSignal(subjectOne, { injector }));
      tick();
      expect(sut()).toBe(1);
      sut.set(subjectTwo);
      expect(sut()).toBe(6);
      subjectOne.next(2);
      expect(sut()).toBe(6);
      subjectTwo.next(7);
      expect(sut()).toBe(7);
    }));

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
  });

  describe('errors', () => {
    it('throws when subscribable async source throws', fakeAsync(() => {
      const obs$ = timer(1000).pipe(
        tap(() => {
          throw new Error();
        }),
        startWith(6)
      );
      const sut = autoDetectChangesSignal(fixture, asyncSignal(obs$, { injector }));
      expect(sut()).toBe(6);
      tick(1000); // get observable to throw error.
      expect(() => sut()).toThrowError();
    }));

    it('throws when PromiseLike async source is rejected', fakeAsync(() => {
      let reject: () => void = () => {};
      const asyncSource = new Promise<number>((_, r) => {
        reject = r;
      });
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector }));
      expect(sut()).toBe(undefined);
      reject();
      tick(); // need to process the reject.
      expect(() => sut()).toThrowError();
    }));

    it('will not update after an error has been thrown', fakeAsync(() => {
      let reject: () => void = () => {};
      const asyncSource = new Promise<number>((_, r) => {
        reject = r;
      });
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector }));
      reject(); // this will go undetected... at first.
      sut.set(Promise.resolve(5));
      flush(); // ensure all promises resolve
      expect(() => sut()).toThrowError();
    }));

    it('will not create a new error after an error has been thrown', fakeAsync(() => {
      let reject: (reason: unknown) => void = () => {};
      const asyncSource = new Promise<number>((_, r) => (reject = r));
      const sut = autoDetectChangesSignal(fixture, asyncSignal(asyncSource, { injector }));
      reject('error1'); // there is intentionally no tick after.  Use cause to identify
      sut.set(Promise.reject('error2'));
      flush(); // ensure promises are all resolved
      expect(() => sut()).toThrowMatching((x) => (x as Error).cause === 'error1');
    }));
  });
});

/**
 * This needed to be outside the other asyncSignal tests since the only way to test without options was to be in an injection context.
 * I tried using ngMocks.reset(), but that didn't work either.
 */
describe('asyncSignal', () => {
  it('can be created without options', fakeAsync(() => {
    @Component({ standalone: true })
    class TestComponent {
      sut = asyncSignal(Promise.resolve(1));
    }
    MockBuilder(TestComponent);
    const fixture = MockRender(TestComponent);
    expect(fixture.point.componentInstance.sut()).toBe(undefined);
    tick();
    expect(fixture.point.componentInstance.sut()).toBe(1);
  }));
});
