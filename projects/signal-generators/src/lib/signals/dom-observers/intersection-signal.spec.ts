import { ElementRef } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { replaceGlobalProperty } from 'projects/signal-generators/src/testing/testing-utilities';
import { runComputedAndEffectTests, runDebugNameOptionTest, runInjectorOptionTest, runTypeGuardTests } from '../../../testing/common-signal-tests';
import { setupEnsureSignalWorksWhenObserverIsMissing } from './common-dom-observer-tests.spec';
import { IntersectionSignal, IntersectionSignalValue, intersectionSignal } from './intersection-signal';
import { MockIntersectionObserver } from './mock-observer.spec';

describe('intersectionSignal', () => {
  let restoreObserver: () => void;

  beforeEach(() => {
    restoreObserver = replaceGlobalProperty('IntersectionObserver', MockIntersectionObserver);
  });
  afterEach(() => {
    restoreObserver();
  });
  runDebugNameOptionTest((debugName) => intersectionSignal(null, { debugName }));
  runInjectorOptionTest((injector) => intersectionSignal(null, { injector }));
  runTypeGuardTests(() => intersectionSignal(null));
  runComputedAndEffectTests(
    () => {
      const sut = intersectionSignal(document.createElement('div'));
      return [sut, () => {
        MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
      }];
    }
  );

  setupEnsureSignalWorksWhenObserverIsMissing('IntersectionObserver',
    () => intersectionSignal(document.createElement('div')),
    () => MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]));


  it('should use injection context if injector isn\'t passed on an option.', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(document.createElement('div'), { root: document }));
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  }));

  it('should work if no options are passed.', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(document.createElement('div')));
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  }));

  it('observes changes to a element', fakeAsync(() => {
    const el = document.createElement('div');
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(el));
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  }));
  it('observes changes to a elementRef', fakeAsync(() => {
    const el = new ElementRef(document.createElement('div'));
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(el));
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  }));
  it('observes nothing if the source is null', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(null));
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()).toEqual([]);
  }));
  it('observes nothing if the source is undefined', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(undefined));
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()).toEqual([]);
  }));

  it('passes along observer options from function options', () => {
    const root = document.createElement('div');
    TestBed.runInInjectionContext(() => intersectionSignal(null, { root }));
    expect(MockIntersectionObserver.currentInstance?.initOptions?.root).toBe(root);
  });

  it('converts the root option to an element when passed as an elementRef', () => {
    const rootRef = new ElementRef(document.createElement('div'));
    TestBed.runInInjectionContext(() => intersectionSignal(null, { root: rootRef }));
    expect(MockIntersectionObserver.currentInstance?.initOptions?.root).toBe(rootRef.nativeElement);
  });
  [
    ['set', (sut: IntersectionSignal, next: IntersectionSignalValue) => sut.set(next)] as const,
    ['update', (sut: IntersectionSignal, next: IntersectionSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {

    it(`should observe different elements when the source changes with ${methodName}`, fakeAsync(() => {

      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const sut = TestBed.runInInjectionContext(() => intersectionSignal(el1));
      const mockObserver = MockIntersectionObserver.currentInstance!
      mockObserver.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
      flush();
      expect(sut()[0]?.isIntersecting).toBeTrue();
      setter(sut, el2);
      expect(mockObserver.observed[0][0]).toBe(el2);
      mockObserver.simulateObservation([{ isIntersecting: false } as IntersectionObserverEntry]);
      flush();
      expect(sut()[0]?.isIntersecting).toBeFalse();
    }));
  });

});

