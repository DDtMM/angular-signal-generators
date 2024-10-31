import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { runComputedAndEffectTests, runDoesNotCauseReevaluationsSimplyWhenNested, runTypeGuardTests } from 'projects/signal-generators/src/testing/common-signal-tests';
import { createFixture } from 'projects/signal-generators/src/testing/testing-utilities';
import { ValueSource } from '../../value-source';
import { DomObserverSignal, DomSignalValue, domObserverSignalFactory } from './dom-observer-base';
import { MockObserver } from './mock-observer.spec';
import { MutationSignalValue } from './mutation-signal';


describe('domObserverSignalFactory', () => {
  // this was created outside the other tests because the function relies on creating its own fixture.
  runDoesNotCauseReevaluationsSimplyWhenNested(
    () => {
      const observer = new MockObserver<unknown, unknown, unknown, (value?: number[] | undefined) => void>();
      const sut = createObserverSignalForTest(observer, document.createElement('div'));
      return sut;
    },
    (sut) => sut.set([Math.random()])
  );
});

describe('domObserverSignalFactory', () => {

  let fixture: ComponentFixture<unknown>;

  beforeEach(() => fixture = createFixture());

  runTypeGuardTests(() => createObserverSignalForTest(new MockObserver(), document.createElement('div')));

  describe('for value source', () => {
    runComputedAndEffectTests(
      () => {
        const observer = new MockObserver<unknown, unknown, unknown, (value?: number[] | undefined) => void>();
        const sut = createObserverSignalForTest(observer, document.createElement('div'));
        return [sut, () => observer.simulateObservation([Math.random()])];
      }
    );
  });

  describe('for signal input source', () => {
    runComputedAndEffectTests(
      () => {
        const observer = new MockObserver<unknown, unknown, unknown, (value?: number[] | undefined) => void>();
        const $source = signal(document.createElement('div'));
        const sut = createObserverSignalForTest(observer, $source);
        return [sut, () => observer.simulateObservation([Math.random()])];
      }
    );
  });

  it('should call disconnect when the context it is in is destroyed', () => {
    const observer = new MockObserver();
    // no need to assign it to a variable since we are testing that the observer.disconnect is called.
    createObserverSignalForTest(observer, document.createElement('div'));
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

  it('should update default options when options are passed to set even if observed does not change', () => {
    const observer = new MockObserver();
    const originalElement = document.createElement('div');
    const sut = createObserverSignalForTest(observer, originalElement);
    const secondElement = document.createElement('div');
    const nextOptions = { box: 'border-box' };
    sut.set(originalElement, nextOptions); // even if observed is null the options should be preserved.
    sut.set(secondElement);
    expect(observer.disconnect).toHaveBeenCalledTimes(3);
    expect(observer.observe).toHaveBeenCalledTimes(3);
    expect(observer.observe).toHaveBeenCalledWith(secondElement, nextOptions);
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

});


function createObserverSignalForTest<D extends MockObserver>(observer: D, source: ValueSource<DomSignalValue<D>>): DomObserverSignal<D, DomSignalValue<D>> {
  return domObserverSignalFactory<D, DomSignalValue<D>, Node>(
    (callback) => {
      observer.callback = callback;
      return observer;
    },
    source,
    {},
    getNode,
    undefined,
    TestBed.inject(Injector)) as DomObserverSignal<MutationObserver, Node>;

  function getNode(value: MutationSignalValue): Node | undefined {
    return (value != null && 'nativeElement' in value) ? value.nativeElement : value ?? undefined;
  }
}

