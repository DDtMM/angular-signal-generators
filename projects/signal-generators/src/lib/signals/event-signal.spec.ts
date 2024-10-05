import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockedComponentFixture, MockRender, ngMocks } from 'ng-mocks';
import { setupComputedAndEffectTests, setupDoesNotCauseReevaluationsSimplyWhenNested, setupTypeGuardTests } from '../../testing/common-signal-tests';
import { eventSignal } from './event-signal';

describe('eventSignal', () => {

  setupTypeGuardTests(() =>
    TestBed.runInInjectionContext(() => eventSignal('body', 'click', () => {}))
  );

  describe('common issues checks', () => {
    let elem: HTMLElement
    beforeEach(() => elem = document.createElement('div'));

    setupDoesNotCauseReevaluationsSimplyWhenNested(
      () => TestBed.runInInjectionContext(() => eventSignal(elem, 'click')),
      () => ngMocks.click(elem),
    );

    setupComputedAndEffectTests(() => {
      const sut = TestBed.runInInjectionContext(() => eventSignal(elem, 'click'));
      return [sut, () => ngMocks.click(elem)];
    });
  });


  it('ignores undefined values', () => {
    const sut = TestBed.runInInjectionContext(() => eventSignal(undefined, 'click'));
    TestBed.flushEffects();
    expect(sut()).toBe(undefined);
  });
  it('can listen to a string value', () => {
    const sut = TestBed.runInInjectionContext(() => eventSignal('body', 'click'));
    const bodyElem = document.querySelector('body');
    ngMocks.click(bodyElem);
    expect(sut()).toBeInstanceOf(Event);
  });
  it('can listen to a HTMLElement', () => {
    const elem = document.createElement('div');
    const sut = TestBed.runInInjectionContext(() => eventSignal(elem, 'click'));
    ngMocks.click(elem);
    expect(sut()).toBeInstanceOf(Event);
  });
  it('can listen to a ElementRef', () => {
    const elemRef = new ElementRef(document.createElement('div'));
    const sut = TestBed.runInInjectionContext(() => eventSignal(elemRef, 'click'));
    ngMocks.click(elemRef.nativeElement);
    expect(sut()).toBeInstanceOf(Event);
  });

  describe('Body literal Tests', () => {
    @Component({
      template: `<div></div>`,
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestComponent {
      /** Either buttonOne or buttonTwo depending on the value of $swapButtons */
      readonly $sut = eventSignal('body', 'click');
    }

    let fixture: MockedComponentFixture<TestComponent, TestComponent>;

    beforeEach(() => fixture = MockRender(TestComponent));

    it('listens to string literal', () => {
      const sut = fixture.point.componentInstance.$sut;
      expect(sut()).toBe(undefined);
      ngMocks.click(document.body);
      expect(sut()).toBeInstanceOf(Event);
    });

    it('stops listening when component is destroyed', () => {
      ngMocks.click(document.body);
      const sut = fixture.point.componentInstance.$sut;
      const lastEvent = sut();
      fixture.destroy();
      ngMocks.click(document.body);
      expect(sut()).toBe(lastEvent);
    });
  });
  describe('Inside a component', () => {

    @Component({
      template: `<button #btn1 id="btn1">1</button><button #btn2 id="btn2">2</button>`,
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestComponent {
      /** Either buttonOne or buttonTwo depending on the value of $swapButtons */
      readonly $buttonCurrent = computed(() => (this.$swapButtons() ? this.$buttonTwo() : this.$buttonOne()));
      readonly $buttonOne = viewChild<ElementRef<HTMLButtonElement>>('btn1');
      readonly $buttonTwo = viewChild<ElementRef<HTMLButtonElement>>('btn2');
      readonly $swapButtons = signal(false);
    }

    let fixture: MockedComponentFixture<TestComponent, TestComponent>;

    beforeEach(() => fixture = MockRender(TestComponent));

    describe('from a value', () => {
      it('initially returns undefined if no initialValue passed', () => {
        const elem = ngMocks.find('#btn1').nativeElement;
        const sut = TestBed.runInInjectionContext(() => eventSignal(elem, 'click', () => 'clicked'));
        expect(sut()).toBe(undefined);
      });
      it('initially returns the initialValue if passed', () => {
        const elem = ngMocks.find('#btn1').nativeElement;
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(elem, 'click', () => 'clicked', { initialValue: 'not clicked' })
        );
        expect(sut()).toBe('not clicked');
      });
      it('listens to the passed element and return event when no selector present', () => {
        const elem = ngMocks.find('#btn1').nativeElement;
        const sut = TestBed.runInInjectionContext(() => eventSignal(elem, 'click'));
        ngMocks.click(elem);
        expect(sut()).toBeInstanceOf(Event);
      });
      it('listens to the passed element and map value when selector present', () => {
        const elem = ngMocks.find('#btn1').nativeElement;
        const sut = TestBed.runInInjectionContext(() => eventSignal(elem, 'click', () => 'clicked'));
        ngMocks.click(elem);
        expect(sut()).toBe('clicked');
      });
    });

    describe('from a signal', () => {
      it('initially returns undefined if no initialValue passed', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(fixture.point.componentInstance.$buttonOne, 'click', () => 'clicked')
        );
        expect(sut()).toBe(undefined);
      });
      it('initially returns the initialValue if passed', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(fixture.point.componentInstance.$buttonOne, 'click', () => 'clicked', { initialValue: 'not clicked' })
        );
        expect(sut()).toBe('not clicked');
      });
      it('passes along injector option', () => {
        // signal version uses injector at several point so it will break if not present.
        const sut =
          eventSignal(fixture.point.componentInstance.$buttonOne, 'click', { injector: fixture.componentRef.injector });
          TestBed.flushEffects();
          ngMocks.click('#btn1');
          expect(sut()).toBeInstanceOf(Event);
      });
      it('listens to the signal and map value when selector present', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(fixture.point.componentInstance.$buttonOne, 'click', (evt: Event) => (evt.target as HTMLElement).innerText)
        );
        TestBed.flushEffects();
        ngMocks.click('#btn1');
        expect(sut()).toBe('1');
      });
      it('listens to the correct element when element changed', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(
            fixture.point.componentInstance.$buttonCurrent,
            'click',
            (evt: Event) => (evt.target as HTMLElement).innerText
          )
        );
        TestBed.flushEffects();
        ngMocks.click('#btn1');
        expect(sut()).toBe('1');
        fixture.point.componentInstance.$swapButtons.set(true);
        TestBed.flushEffects();
        ngMocks.click('#btn2');
        expect(sut()).toBe('2');
        ngMocks.click('#btn1');
        expect(sut()).toBe('2');
      });
    });
  });
});
