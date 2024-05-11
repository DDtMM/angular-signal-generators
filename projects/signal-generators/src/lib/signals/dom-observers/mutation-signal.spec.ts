import { Component, ElementRef, Injector, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockRender, MockedComponentFixture, ngMocks } from 'ng-mocks';
import { MutationSignal, MutationSignalValue, mutationSignal } from './mutation-signal';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../../testing/common-signal-tests.spec';
import { delayForObserver, setupEnsureSignalWorksWhenObserverIsMissing } from './dom-observer-test-utilities.spec';

@Component({
  standalone: true,
  template: `<div id="el1" #el1>Some Content.</div><div id="el2" #el2>Some Content.</div>`
})
class TestComponent {
  readonly el1 = viewChild.required<ElementRef>('el1');
  readonly el2 = viewChild.required<ElementRef>('el2');
}

describe('mutationSignal', () => {

  let component: TestComponent;
  let fixture: MockedComponentFixture<TestComponent, TestComponent>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender(TestComponent);
    component = fixture.point.componentInstance;
    injector = fixture.componentRef.injector;
  });
  // "setupDoesNotCauseReevaluationsSimplyWhenNested" won't work because that test requires its own MockRender.
  setupTypeGuardTests(() => mutationSignal(component.el1, { injector }));
  setupComputedAndEffectTests(
    () => {
      const sut = mutationSignal(component.el1, { injector });
      return [sut, async () => {
        component.el1().nativeElement.setAttribute('data-blah', 'hello');
        await delayForObserver();
      }];
    },
    undefined,
    () => fixture,
    true
  );
  setupEnsureSignalWorksWhenObserverIsMissing('MutationObserver', () => mutationSignal(component.el1, { injector }), () => component.el1().nativeElement.setAttribute('data-blah', 'hello'));


  it('should use injection context if injector isn\'t passed on an option.', async () => {
    const sut = TestBed.runInInjectionContext(() => mutationSignal(component.el1));
    component.el1().nativeElement.setAttribute('data-blah', 'hello');
    await delayForObserver();
    expect(sut()[0]?.attributeName === 'data-blah').toBeDefined();
  });

  it('observes changes to a node and elementRef attribute changes by default', async () => {
    // these tests are compressed into one because of the delay introduced by waiting for mutation observer.
    const node = ngMocks.find(fixture, 'div').nativeNode;
    const sutEl = mutationSignal(component.el1, { injector });
    const sutNode = mutationSignal(node, { injector });
    component.el1().nativeElement.setAttribute('data-el-value', 'howdy');
    node.setAttribute('data-node-value', 'hello there');
    await delayForObserver();
    expect(sutNode()[0]?.attributeName === 'data-el-value').toBeDefined();
    expect(sutEl()[0]?.attributeName === 'data-node-value').toBeDefined();
  });

  it('observes nothing if the source is null or undefined', () => {
    const sut1 = mutationSignal(null, { injector });
    const sut2 = mutationSignal(undefined, { injector });
    expect(sut1()).toEqual([]);
    expect(sut2()).toEqual([]);
  });

  it('passes along observer options from function options', async () => {
    const node: HTMLElement = ngMocks.find(fixture, '#el1').nativeElement;
    const sut = mutationSignal(node, { injector, childList: true, subtree: true });
    node.innerText = 'hello';
    await delayForObserver();
    expect(Array.from(sut()[0]?.addedNodes).some(x => x.textContent === 'hello')).toBeDefined();
  });

  it('should use new options when provided with set', async () => {
    const el1: HTMLElement = ngMocks.find(fixture, '#el1').nativeElement;
    const sut = mutationSignal(el1, { injector });
    el1.innerText = 'hello';
    await delayForObserver();
    expect(sut()).toEqual([]);
    sut.set(el1, { childList: true, subtree: true });
    el1.innerText = 'hello again';
    await delayForObserver();
    expect(Array.from(sut()[0]?.addedNodes).some(x => x.textContent === 'hello again')).toBeDefined();
  });

  [
    ['set', (sut: MutationSignal, next: MutationSignalValue) => sut.set(next)] as const,
    ['update', (sut: MutationSignal, next: MutationSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {

    it(`should observe different elements when the source changes with ${methodName}`, async () => {
      const node1 = ngMocks.find(fixture, '#el1').nativeNode;
      const node2 = ngMocks.find(fixture, '#el2').nativeNode;
      const sut = mutationSignal(node1, { injector, childList: true, subtree: true });
      node1.innerText = 'hello';
      await delayForObserver();
      expect(Array.from(sut()[0]?.addedNodes).some(x => x.textContent === 'hello')).toBeDefined();
      setter(sut, node2);
      node1.innerText = 'This should be ignored';
      expect(Array.from(sut()[0]?.addedNodes).some(x => x.textContent === 'hello')).toBeDefined();
      node2.innerText = 'hello again';
      expect(Array.from(sut()[0]?.addedNodes).some(x => x.textContent === 'hello again')).toBeDefined();
    });
  });

});

