import { ElementRef, Injector } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { replaceGlobalProperty } from 'projects/signal-generators/src/testing/testing-utilities';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../../testing/common-signal-tests';
import { setupEnsureSignalWorksWhenObserverIsMissing } from './common-dom-observer-tests.spec';
import { IntersectionSignal, IntersectionSignalValue, intersectionSignal } from './intersection-signal';
import { MockIntersectionObserver } from './mock-observer.spec';
import { MockRender, MockedComponentFixture } from 'ng-mocks';

describe('intersectionSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;
  let restoreObserver: () => void;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
    restoreObserver = replaceGlobalProperty('IntersectionObserver', MockIntersectionObserver);
  });
  afterEach(() => {
    restoreObserver();
  });

  setupTypeGuardTests(() => intersectionSignal(null, { injector }));
  setupComputedAndEffectTests(
    () => {
      const sut = intersectionSignal(document.createElement('div'), { injector });
      return [sut, () => {
        MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
      }];
    },
    undefined,
    () => fixture
  );

  setupEnsureSignalWorksWhenObserverIsMissing('IntersectionObserver',
    () => intersectionSignal(document.createElement('div'), { injector }),
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
    const sut = intersectionSignal(el, { injector });
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  }));
  it('observes changes to a elementRef', fakeAsync(() => {
    const el = new ElementRef(document.createElement('div'));
    const sut = intersectionSignal(el, { injector });
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  }));
  it('observes nothing if the source is null', fakeAsync(() => {
    const sut = intersectionSignal(null, { injector });
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()).toEqual([]);
  }));
  it('observes nothing if the source is undefined', fakeAsync(() => {
    const sut = intersectionSignal(undefined, { injector });
    MockIntersectionObserver.currentInstance?.simulateObservation([{ isIntersecting: true } as IntersectionObserverEntry]);
    flush();
    expect(sut()).toEqual([]);
  }));

  it('passes along observer options from function options', () => {
    const root = document.createElement('div');
    intersectionSignal(null, { injector, root });
    expect(MockIntersectionObserver.currentInstance?.initOptions?.root).toBe(root);
  });

  it('converts the root option to an element when passed as an elementRef', () => {
    const rootRef = new ElementRef(document.createElement('div'));
    intersectionSignal(null, { injector, root: rootRef });
    expect(MockIntersectionObserver.currentInstance?.initOptions?.root).toBe(rootRef.nativeElement);
  });
  [
    ['set', (sut: IntersectionSignal, next: IntersectionSignalValue) => sut.set(next)] as const,
    ['update', (sut: IntersectionSignal, next: IntersectionSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {

    it(`should observe different elements when the source changes with ${methodName}`, fakeAsync(() => {

      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const sut = intersectionSignal(el1, { injector });
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

