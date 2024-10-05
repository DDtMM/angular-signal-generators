import { ElementRef, Injector } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { replaceGlobalProperty } from 'projects/signal-generators/src/testing/testing-utilities';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../../testing/common-signal-tests';
import { setupEnsureSignalWorksWhenObserverIsMissing } from './common-dom-observer-tests.spec';
import { MockMutationObserver } from './mock-observer.spec';
import { MutationSignal, MutationSignalValue, mutationSignal } from './mutation-signal';


describe('mutationSignal', () => {

  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;
  let restoreObserver: () => void;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
    restoreObserver = replaceGlobalProperty('MutationObserver', MockMutationObserver);
  });
  afterEach(() => {
    restoreObserver();
  });

  setupTypeGuardTests(() => mutationSignal(document.createElement('div'), { injector }));
  setupComputedAndEffectTests(
    () => {
      const sut = mutationSignal(document.createElement('div'), { injector });
      return [sut, () => {
        MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-blah' } as MutationRecord]);
      }];
    },
    undefined,
    () => fixture
  );
  setupEnsureSignalWorksWhenObserverIsMissing('MutationObserver',
    () => mutationSignal(document.createElement('div'), { injector }),
    () => MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-blah' } as MutationRecord])
  );

  it('should use injection context if injector isn\'t passed on an option.', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => mutationSignal(document.createElement('div')));
    MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-happy' } as MutationRecord]);
    flush();
    expect(sut()[0]?.attributeName).toBe('data-happy');
  }));
  it('observes changes to a node', fakeAsync(() => {
    const el = document.createTextNode('howdy');
    const sut = mutationSignal(el, { injector });
    MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-happy' } as MutationRecord]);
    flush();
    expect(sut()[0]?.attributeName).toBe('data-happy');
  }));
  it('observes changes to a elementRef', fakeAsync(() => {
    const el = new ElementRef(document.createElement('div'));
    const sut = mutationSignal(el, { injector });
    MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-happy' } as MutationRecord]);
    flush();
    expect(sut()[0]?.attributeName).toBe('data-happy');
  }));

  it('observes nothing if the source is null', fakeAsync(() => {
    const sut = mutationSignal(null, { injector });
    MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-happy' } as MutationRecord]);
    flush();
    expect(sut()).toEqual([]);
  }));
  it('observes nothing if the source is undefined', fakeAsync(() => {
    const sut = mutationSignal(undefined, { injector });
    MockMutationObserver.currentInstance?.simulateObservation([{ attributeName: 'data-happy' } as MutationRecord]);
    flush();
    expect(sut()).toEqual([]);
  }));
  it('passes along observer options from function options', () => {
    // by default content-box is observed, so changing to border-box will allow us to observe border changes.
    mutationSignal(document.createElement('div'), { injector, attributes: true});
    expect(MockMutationObserver.currentInstance?.observed[0][1]?.attributes).toBe(true);
  });

  it('should use new options when provided with set',() => {
    const sut = mutationSignal(null, { injector, attributes: false });
    sut.set(document.createElement('div'), { attributes: true });
    expect(MockMutationObserver.currentInstance?.observed[0][1]?.attributes).toBe(true);
  });

  [
    ['set', (sut: MutationSignal, next: MutationSignalValue) => sut.set(next)] as const,
    ['update', (sut: MutationSignal, next: MutationSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {

    it(`should observe different elements when the source changes with ${methodName}`, fakeAsync(() => {

      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const sut = mutationSignal(el1, { injector });
      const mockObserver = MockMutationObserver.currentInstance!
      mockObserver.simulateObservation([{ attributeName: 'data-friend' } as MutationRecord]);
      flush();
      expect(sut()[0]?.attributeName).toBe('data-friend');
      setter(sut, el2);
      expect(mockObserver.observed[0][0]).toBe(el2);
      mockObserver.simulateObservation([{ attributeName: 'data-dog' } as MutationRecord]);
      flush();
      expect(sut()[0]?.attributeName).toBe('data-dog');
    }));
  });

});

