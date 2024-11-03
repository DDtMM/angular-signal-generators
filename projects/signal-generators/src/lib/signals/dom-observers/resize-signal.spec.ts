import { ElementRef } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { replaceGlobalProperty } from 'projects/signal-generators/src/testing/testing-utilities';
import { runComputedAndEffectTests, runDebugNameOptionTest, runInjectorOptionTest, runTypeGuardTests } from '../../../testing/common-signal-tests';
import { setupEnsureSignalWorksWhenObserverIsMissing } from './common-dom-observer-tests.spec';
import { MockResizeObserver } from './mock-observer.spec';
import { ResizeSignal, ResizeSignalValue, resizeSignal } from './resize-signal';

describe('resizeSignal', () => {
  let restoreObserver: () => void;

  beforeEach(() => {
    restoreObserver = replaceGlobalProperty('ResizeObserver', MockResizeObserver);
  });
  afterEach(() => {
    restoreObserver();
  });

  runDebugNameOptionTest((debugName) => resizeSignal(document.createElement('div'), { debugName }));
  runInjectorOptionTest((injector) => resizeSignal(document.createElement('div'), { injector }));
  runTypeGuardTests(() => resizeSignal(document.createElement('div')));
  runComputedAndEffectTests(
    () => {
      const sut = resizeSignal(document.createElement('div'));
      return [sut, () => {
        MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: Math.random() } }  as ResizeObserverEntry]);
      }];
    }
  );
  setupEnsureSignalWorksWhenObserverIsMissing('ResizeObserver',
    () => resizeSignal(document.createElement('div')),
    () => MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: Math.random() } } as ResizeObserverEntry])
  );

  it('should use injection context if injector isn\'t passed on an option.', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => resizeSignal(document.createElement('div')));
    MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: 250 } } as ResizeObserverEntry]);
    flush();
    expect(sut()[0]?.contentRect.height).toBe(250);
  }));

  it('observes changes to a element', fakeAsync(() => {
    const el = document.createElement('div');
    const sut = TestBed.runInInjectionContext(() => resizeSignal(el));
    MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: 400 } } as ResizeObserverEntry]);
    flush();
    expect(sut()[0]?.contentRect.height).toBe(400);
  }));
  it('observes changes to a elementRef', fakeAsync(() => {
    const el = new ElementRef(document.createElement('div'));
    const sut = TestBed.runInInjectionContext(() => resizeSignal(el));
    MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: 400 } } as ResizeObserverEntry]);
    flush();
    expect(sut()[0]?.contentRect.height).toBe(400);
  }));

  it('observes nothing if the source is null', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => resizeSignal(null));
    MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: 400 } } as ResizeObserverEntry]);
    flush();
    expect(sut()).toEqual([]);
  }));
  it('observes nothing if the source is undefined', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => resizeSignal(undefined));
    MockResizeObserver.currentInstance?.simulateObservation([{ contentRect: { height: 400 } } as ResizeObserverEntry]);
    flush();
    expect(sut()).toEqual([]);
  }));

  it('passes along observer options from function options', () => {
    // by default content-box is observed, so changing to border-box will allow us to observe border changes.
    TestBed.runInInjectionContext(() => resizeSignal(document.createElement('div'), { box: 'border-box' }));
    expect(MockResizeObserver.currentInstance?.observed[0][1]?.box).toBe('border-box');
  });

  it('should use new options when provided with set',() => {
    const sut = TestBed.runInInjectionContext(() => resizeSignal(null, { box: 'border-box' }));
    sut.set(document.createElement('div'), { box: 'content-box' });
    expect(MockResizeObserver.currentInstance?.observed[0][1]?.box).toBe('content-box');
  });

  [
    ['set', (sut: ResizeSignal, next: ResizeSignalValue) => sut.set(next)] as const,
    ['update', (sut: ResizeSignal, next: ResizeSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {
    it(`should observe different elements when the source changes with ${methodName}`, fakeAsync(() => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const sut = TestBed.runInInjectionContext(() => resizeSignal(el1));
      const mockObserver = MockResizeObserver.currentInstance!
      mockObserver.simulateObservation([{ contentRect: { height: 400 } } as ResizeObserverEntry]);
      flush();
      expect(sut()[0]?.contentRect.height).toBe(400);
      setter(sut, el2);
      expect(mockObserver.observed[0][0]).toBe(el2);
      mockObserver.simulateObservation([{ contentRect: { height: 200 } } as ResizeObserverEntry]);
      flush();
      expect(sut()[0]?.contentRect.height).toBe(200);
    }));
  });

});

