import { Component, ElementRef, Injector, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockRender, MockedComponentFixture, ngMocks } from 'ng-mocks';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../../testing/common-signal-tests.spec';
import { delayForObserver, setupEnsureSignalWorksWhenObserverIsMissing } from './dom-observer-test-utilities.spec';
import { ResizeSignal, ResizeSignalValue, resizeSignal } from './resize-signal';

@Component({
  //changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <div id="el1" style="background:red; width: 10px; height: 100px; border: 5px solid black" #el1></div>
    <div id="el2" style="background:green; width: 10px; height: 100px;" #el2></div>
  `
})
class TestComponent {
  readonly el1 = viewChild.required<ElementRef>('el1');
  readonly el2 = viewChild.required<ElementRef>('el2');
  setHeight(height: number): void {
    this.el1().nativeElement.style.height = `${height}px`;
    this.el2().nativeElement.style.height = `${height}px`;
  }
}

describe('resizeSignal', () => {

  let component: TestComponent;
  let fixture: MockedComponentFixture<TestComponent, TestComponent>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender(TestComponent);
    component = fixture.point.componentInstance;
    injector = fixture.componentRef.injector;
  });
  // "setupDoesNotCauseReevaluationsSimplyWhenNested" won't work because that test requires its own MockRender.
  setupTypeGuardTests(() => resizeSignal(component.el1, { injector }));
  setupComputedAndEffectTests(
    () => {
      const sut = resizeSignal(component.el1, { injector });
      return [sut, async () => {
        component.setHeight(400);
        await delayForObserver();
      }];
    },
    undefined,
    () => fixture,
    true
  );
  setupEnsureSignalWorksWhenObserverIsMissing('ResizeObserver',
  () => resizeSignal(component.el1, { injector }),
  () => component.setHeight(400)
);

  it('should use injection context if injector isn\'t passed on an option.', async () => {
    const sut = TestBed.runInInjectionContext(() => resizeSignal(component.el1));
    component.setHeight(250);
    await delayForObserver();
    expect(sut()[0]?.contentRect.height).toBe(250);
  });

  it('observes changes to a Element and ElementRef attribute changes by default', async () => {
    // these tests are compressed into one because of the delay introduced by waiting for mutation observer.
    const sutElRef = resizeSignal(component.el1, { injector });
    const sutEl = resizeSignal(ngMocks.find(fixture, '#el2').nativeElement, { injector });
    component.setHeight(335);
    await delayForObserver();
    expect(sutEl()[0]?.contentRect.height).toBe(335);
    expect(sutElRef()[0]?.contentRect.height).toBe(335);
  });

  it('observes nothing if the source is null or undefined', () => {
    const sut1 = resizeSignal(null, { injector });
    const sut2 = resizeSignal(undefined, { injector });
    expect(sut1()).toEqual([]);
    expect(sut2()).toEqual([]);
  });

  it('passes along observer options from function options', async () => {
    // by default content-box is observed, so changing to border-box will allow us to observe border changes.
    const sut = resizeSignal(component.el1, { injector, box: 'border-box' });
    await delayForObserver();
    expect(sut()[0]?.borderBoxSize[0].blockSize).toBeCloseTo(110, -1);
    component.el1().nativeElement.style.borderWidth = '10px'; // this wouldn't cause an update with content-box
    await delayForObserver();
    // the original height was 100 and the borderWidth was 5 for a total of 110, the new width makes it around 120.
    expect(sut()[0]?.borderBoxSize[0].blockSize).toBeCloseTo(120, -1);
  });
  it('should use new options when provided with set', async () => {
    const el1: Element = ngMocks.find(fixture, '#el1').nativeElement;
    const sut = resizeSignal(el1, { injector, box: 'content-box' });
    await delayForObserver();
    expect(sut()[0]?.borderBoxSize[0].blockSize).toBeCloseTo(110, -1);
    component.el1().nativeElement.style.borderWidth = '10px'
    await delayForObserver();
    // even though the border changed, there was no update.
    expect(sut()[0]?.borderBoxSize[0].blockSize).toBeCloseTo(110, -1);
    sut.set(el1, { box: 'border-box' });
    await delayForObserver();
    // the original height was 100 and the borderWidth was 5 for a total of 110, the new width makes it around 120.
    expect(sut()[0]?.borderBoxSize[0].blockSize).toBeCloseTo(120, -1);
  });
  [
    ['set', (sut: ResizeSignal, next: ResizeSignalValue) => sut.set(next)] as const,
    ['update', (sut: ResizeSignal, next: ResizeSignalValue) => sut.update(() => next)] as const
  ].forEach(([methodName, setter]) => {
    it(`should observe different elements when the source changes with ${methodName}`, async () => {
      const el1 = ngMocks.find(fixture, '#el1').nativeElement;
      const el2 = ngMocks.find(fixture, '#el2').nativeElement;
      const sut = resizeSignal(el1, { injector });
      el1.style.height = '260px'
      await delayForObserver();
      expect(sut()[0]?.contentRect.height).toBe(260);
      setter(sut, el2);
      await delayForObserver();
      expect(sut()[0]?.contentRect.height).toBe(100); // resize observer will emit the current value after a delay.
      el1.style.height = '405px';
      await delayForObserver();
      expect(sut()[0]?.contentRect.height).toBe(100); // nothing should have changed.
      el2.style.height = '115px';
      await delayForObserver();
      expect(sut()[0]?.contentRect.height).toBe(115);
    });
  });

});

