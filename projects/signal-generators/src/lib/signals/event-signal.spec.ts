import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ngMocks } from 'ng-mocks';
import {
  runComputedAndEffectTests,
  runDebugNameOptionTest,
  runDoesNotCauseReevaluationsSimplyWhenNested,
  runInjectorOptionTest,
  runTypeGuardTests
} from '../../testing/common-signal-tests';
import { eventSignal } from './event-signal';

const DUMMY_FN = () => undefined;
describe('eventSignal', () => {
  runDebugNameOptionTest((debugName) => eventSignal('body', 'click', DUMMY_FN, { debugName }));
  runInjectorOptionTest((injector) => eventSignal('body', 'click', DUMMY_FN, { injector }));
  runTypeGuardTests(() => eventSignal('body', 'click', DUMMY_FN));
  runDebugNameOptionTest((debugName) => eventSignal(signal('body'), 'click', DUMMY_FN, { debugName }));
  runInjectorOptionTest((injector) => eventSignal(signal('body'), 'click', DUMMY_FN, { injector }));
  runTypeGuardTests(() => eventSignal(signal('body'), 'click', DUMMY_FN));

  describe('common tests', () => {
    let elem: HTMLElement;
    beforeEach(() => (elem = document.createElement('div')));

    runDoesNotCauseReevaluationsSimplyWhenNested(
      () => TestBed.runInInjectionContext(() => eventSignal(elem, 'click')),
      () => ngMocks.click(elem)
    );

    runComputedAndEffectTests(() => {
      const sut = TestBed.runInInjectionContext(() => eventSignal(elem, 'click'));
      return [sut, () => ngMocks.click(elem)];
    });
  });

  it('ignores undefined values', () => {
    const sut = TestBed.runInInjectionContext(() => eventSignal(undefined, 'click'));
    TestBed.tick();
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
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestComponent {
      /** Either buttonOne or buttonTwo depending on the value of $swapButtons */
      readonly $sut = eventSignal('body', 'click');
    }

    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => (fixture = TestBed.createComponent(TestComponent)));

    it('listens to string literal', () => {
      const sut = fixture.componentInstance.$sut;
      expect(sut()).toBe(undefined);
      ngMocks.click(document.body);
      expect(sut()).toBeInstanceOf(Event);
    });

    it('stops listening when component is destroyed', () => {
      ngMocks.click(document.body);
      const sut = fixture.componentInstance.$sut;
      const lastEvent = sut();
      fixture.destroy();
      ngMocks.click(document.body);
      expect(sut()).toBe(lastEvent);
    });
  });
  describe('Inside a component', () => {
    @Component({
      template: `<button #btn1 id="btn1">1</button><button #btn2 id="btn2">2</button>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestComponent {
      /** Either buttonOne or buttonTwo depending on the value of $swapButtons */
      readonly $buttonCurrent = computed(() => (this.$swapButtons() ? this.$buttonTwo() : this.$buttonOne()));
      readonly $buttonOne = viewChild<ElementRef<HTMLButtonElement>>('btn1');
      readonly $buttonTwo = viewChild<ElementRef<HTMLButtonElement>>('btn2');
      readonly $swapButtons = signal(false);
    }

    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => (fixture = TestBed.createComponent(TestComponent)));

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
          eventSignal(fixture.componentInstance.$buttonOne, 'click', () => 'clicked')
        );
        expect(sut()).toBe(undefined);
      });
      it('initially returns the initialValue if passed', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(fixture.componentInstance.$buttonOne, 'click', () => 'clicked', { initialValue: 'not clicked' })
        );
        expect(sut()).toBe('not clicked');
      });
      it('passes along injector option', () => {
        // signal version uses injector at several point so it will break if not present.
        const sut = eventSignal(fixture.componentInstance.$buttonOne, 'click', { injector: fixture.componentRef.injector });
        fixture.detectChanges(); // interesting that flushEffects doesn't work when we pass the injector.
        ngMocks.click('#btn1');
        expect(sut()).toBeInstanceOf(Event);
      });
      it('listens to the signal and map value when selector present', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(fixture.componentInstance.$buttonOne, 'click', (evt: Event) => (evt.target as HTMLElement).innerText)
        );
        TestBed.tick();
        ngMocks.click('#btn1');
        expect(sut()).toBe('1');
      });
      it('listens to the correct element when element changed', () => {
        const sut = TestBed.runInInjectionContext(() =>
          eventSignal(fixture.componentInstance.$buttonCurrent, 'click', (evt: Event) => (evt.target as HTMLElement).innerText)
        );
        TestBed.tick();
        ngMocks.click('#btn1');
        expect(sut()).toBe('1');
        fixture.componentInstance.$swapButtons.set(true);
        TestBed.tick();
        ngMocks.click('#btn2');
        expect(sut()).toBe('2');
        ngMocks.click('#btn1');
        expect(sut()).toBe('2');
      });
    });
  });
});
