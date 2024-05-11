import { Component, ElementRef, Injector, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockRender, MockedComponentFixture, ngMocks } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../../testing/common-signal-tests.spec';
import { delayForObserver, setupEnsureSignalWorksWhenObserverIsMissing } from './dom-observer-test-utilities.spec';
import { IntersectionSignal, IntersectionSignalValue, intersectionSignal } from './intersection-signal';

@Component({
  standalone: true,
  template: `
<div #outer style="overflow: auto; width: 100px; height: 100px; background: gray;">
  <div #innerMid id="innerMid" style="position: relative; top: 200px">Mid</div>
  <div #innerBottom id="innerBottom" style="position: relative; top: 600px">Bottom</div>
</div>
      `
})
class TestComponent {
  readonly outer = viewChild.required<ElementRef<HTMLDivElement>>('outer');
  readonly innerMid = viewChild.required<ElementRef<HTMLDivElement>>('innerMid');
  readonly innerBottom = viewChild.required<ElementRef<HTMLDivElement>>('innerBottom');
}

describe('intersectionSignal', () => {

  let component: TestComponent;
  let fixture: MockedComponentFixture<TestComponent, TestComponent>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender(TestComponent);
    component = fixture.point.componentInstance;
    injector = fixture.componentRef.injector;
  });
  // "setupDoesNotCauseReevaluationsSimplyWhenNested" won't work because that test requires its own MockRender.
  setupTypeGuardTests(() => intersectionSignal(component.innerMid, { injector }));
  setupComputedAndEffectTests(
    () => {
      const sut = intersectionSignal(component.innerMid, { injector, root: component.outer() });
      return [sut, async () => {
        component.innerMid().nativeElement.scrollIntoView();
        await delayForObserver();
      }];
    },
    undefined,
    () => fixture,
    true
  );
  setupEnsureSignalWorksWhenObserverIsMissing('IntersectionObserver',
    () => intersectionSignal(component.innerMid, { injector, root: component.outer() }),
    () => component.innerMid().nativeElement.scrollIntoView());


  it('should use injection context if injector isn\'t passed on an option.', async () => {
    const sut = TestBed.runInInjectionContext(() => intersectionSignal(component.innerMid, { injector, root: component.outer() }));
    component.innerMid().nativeElement.scrollIntoView();
    await delayForObserver();
    expect(sut()[0]?.isIntersecting).toBeTrue();
  });

  it('observes changes to a Element and elementRef attribute changes by default', async () => {
    // these tests are compressed into one because of the delay introduced by waiting for mutation observer.
    const el = ngMocks.find(fixture, '#innerMid').nativeElement;
    const sutElRef = intersectionSignal(component.innerMid, { injector, root: component.outer() });
    const sutEl = intersectionSignal(el, { injector });
    component.innerMid().nativeElement.scrollIntoView();
    await delayForObserver();
    expect(sutEl()[0]?.isIntersecting).toBeTrue();
    expect(sutElRef()[0]?.isIntersecting).toBeTrue();
  });

  it('observes nothing if the source is null or undefined', () => {
    const sut1 = intersectionSignal(null, { injector });
    const sut2 = intersectionSignal(undefined, { injector });
    expect(sut1()).toEqual([]);
    expect(sut2()).toEqual([]);
  });

  it('passes along observer options from function options', () => {
    const observerCtorSpy = spyOn(globalThis, 'IntersectionObserver').and.callThrough();
    intersectionSignal(component.innerMid(), { injector, root: component.outer() });
    expect(observerCtorSpy).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({ root: component.outer().nativeElement}));
  });

  [
    ['set', (sut: IntersectionSignal, next: IntersectionSignalValue) => sut.set(next)] as const,
    ['update', (sut: IntersectionSignal, next: IntersectionSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {

    it(`should observe different elements when the source changes with ${methodName}`, async () => {
      const innerMid = component.innerMid().nativeElement;
      const innerBottom = component.innerMid().nativeElement;
      const outer = component.outer().nativeElement;
      const sut = intersectionSignal(innerMid, { root: outer, injector });
      innerMid.scrollIntoView();
      await delayForObserver();
      expect(sut()[0]?.isIntersecting).toBeTrue();
      outer.scrollTop = 0;
      await delayForObserver();
      expect(sut()[0]?.isIntersecting).toBeFalse();
      setter(sut, innerBottom);
      innerBottom.scrollIntoView();
      await delayForObserver();
      expect(sut()[0]?.isIntersecting).toBeTrue();
    });
  });

});

