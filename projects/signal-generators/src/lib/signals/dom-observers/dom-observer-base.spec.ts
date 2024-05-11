import { Injector, signal } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { DomObserverSignal, DomSignalValue, domObserverSignalFactory } from './dom-observer-base';
import { MutationSignalValue } from './mutation-signal';
import { MockObserver } from './mock-observer.spec';
import { ValueSource } from '../../value-source';
import { setupComputedAndEffectTests, setupTypeGuardTests } from 'projects/signal-generators/src/testing/common-signal-tests.spec';

fdescribe('domObserverSignalFactory', () => {

  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });
  // setupDoesNotCauseReevaluationsSimplyWhenNested" won't work because that test requires its own MockRender.
  setupTypeGuardTests(() => createObserverSignalForTest(new MockObserver(), null));
  setupComputedAndEffectTests(
    () => {
      const observer = new MockObserver<unknown, unknown, unknown, (value?: number[] | undefined) => void>();
      const sut = createObserverSignalForTest(observer, null);
      return [sut, () => { console.log(sut()); observer.simulateObservation([Math.random()]); console.log(sut()); }];
    }
  );
  it('should call disconnect when the context it is in is destroyed', () => {
    const observer = new MockObserver();
    // no need to assign it to a variable since we are testing that the observer.disconnect is called.
    createObserverSignalForTest(observer, null);
    fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('should observe nothing if the subject is null or undefined', () => {
    const observer = new MockObserver();
    const sut = createObserverSignalForTest(observer, null);
    sut.set(undefined);
    expect(observer.disconnect).toHaveBeenCalledTimes(2);
    expect(observer.observe).toHaveBeenCalledTimes(0);
  });

  it('should observe a new subject when changed with set', () => {
    const observer = new MockObserver();
    const sut = createObserverSignalForTest(observer, document.createElement('div'));
    sut.set(document.createElement('div'));
    expect(observer.disconnect).toHaveBeenCalledTimes(2);
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });
  it('should observe a new subject when changed with update', () => {
    const observer = new MockObserver();
    const sut = createObserverSignalForTest(observer, document.createElement('div'));
    sut.update((x) => document.createElement(x.tagName));
    expect(observer.disconnect).toHaveBeenCalledTimes(2);
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });
  it('should observe a new subject when changed from signal', fakeAsync(() => {
    const observer = new MockObserver();
    const $subject = signal<HTMLElement>(document.createElement('div'));
    createObserverSignalForTest(observer, $subject);
    $subject.set(document.createElement('div'));
    fixture.detectChanges(); // cause effect to fire.
    expect(observer.disconnect).toHaveBeenCalledTimes(2);
    expect(observer.observe).toHaveBeenCalledTimes(2);
  }));

  function createObserverSignalForTest<D extends MockObserver>(observer: D, source: ValueSource<DomSignalValue<D>>): DomObserverSignal<D, DomSignalValue<D>> {
    return domObserverSignalFactory<D, DomSignalValue<D>, Node>(
      (callback) => {
        console.log(callback);
        observer.callback = (callback as any);
        return observer;
      },
      source,
      {},
      getNode,
      [],
      injector) as DomObserverSignal<MutationObserver, Node>;
  }
  function getNode(value: MutationSignalValue): Node | undefined {
    return (value != null && 'nativeElement' in value) ? value.nativeElement : value ?? undefined;
  }
});

