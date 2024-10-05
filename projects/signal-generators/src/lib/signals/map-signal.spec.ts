import { Component, WritableSignal, signal } from '@angular/core';
import { setupComputedAndEffectTests, setupDoesNotCauseReevaluationsSimplyWhenNested, setupTypeGuardTests } from '../../testing/common-signal-tests';
import { mapSignal } from './map-signal';
import { FormsModule } from '@angular/forms';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { BehaviorSubject } from 'rxjs';
import { TestBed } from '@angular/core/testing';

describe('mapSignal', () => {
  setupTypeGuardTests(() => mapSignal(1, (x) => x + 1));

  it('throws if not enough parameters are passed', () => {
    expect(() => (mapSignal as unknown as (x: number) => void)(1)).toThrow();
  })

  describe('when passed signals', () => {
    let signal1: WritableSignal<number>;
    let signal2: WritableSignal<number>;
    beforeEach(() => {
      signal1 = signal(3);
      signal2 = signal(5);
    });
    setupComputedAndEffectTests(() => {
      const source = signal(1);
      const sut = mapSignal(source, x => x + 1);
      return [sut, () => { source.set(2) }];
    });
    setupDoesNotCauseReevaluationsSimplyWhenNested(
      () => mapSignal(signal1, x => x + 1),
      () => signal1.set(4)
    );

    it('the typings are correct for a single signal', () => {
      const source = mapSignal(signal1, (a) => a + 1);
      expect(source()).toBe(4);
    });
    it('initially returns mapped value', () => {
      const source = mapSignal(signal1, signal2, (a, b) => a * b + 1);
      expect(source()).toBe(16);
    });
    it('can be mapped from value sources of different types.', () => {
      const number$ = new BehaviorSubject<number>(5)
      const $text = signal<string>('The value of a + b is: ');
      const source = TestBed.runInInjectionContext(() => mapSignal(signal1, number$, $text, (a, b, text) => `${text}${a + b}`));
      signal1.set(10);
      expect(source()).toBe('The value of a + b is: 15');
      number$.next(6);
      expect(source()).toBe('The value of a + b is: 16');
      $text.set('A + B = ');
      expect(source()).toBe('A + B = 16');
    });
    it('respects options.equal value', () => {
      const source = mapSignal(signal1, signal2, (a, b) => a * b, { equal: (_, b: number) => b % 2 === 1 });
      expect(source()).toBe(15); // this is a little dodgy, equal won't run if it doesn't think the signal is being listened to.
      signal1.set(5);
      expect(source()).toBe(15); // this should NOT change because of silly equal function.
      signal1.set(6);
      expect(source()).toBe(30);
    });
    it('updates when an input signal changes', () => {
      const source = mapSignal(signal1, signal2, (a, b) => a * b + 1);
      signal1.set(10);
      expect(source()).toBe(51);
    });
  });
  describe('when passed a value', () => {
    setupComputedAndEffectTests(() => {
      const sut = mapSignal(1, x => x + 1);
      return [sut, () => { sut.set(2) }];
    });
    setupDoesNotCauseReevaluationsSimplyWhenNested(
      () => mapSignal(1, x => x + 1),
      (sut) => sut.set(4)
    );
    it('works with ngModel when bound to input', async() => {
      @Component({
        imports: [FormsModule],
        selector: 'app-test',
        template: `<input data-test="sutInput" type="number" [(ngModel)]="$sut.input" />`,
      })
      class TestComponent {
        readonly $sut = mapSignal(6, x => x + 2);
      };
      await MockBuilder(TestComponent).keep(FormsModule);
      MockRender('<app-test />');
      const sut = ngMocks.find(TestComponent).componentInstance.$sut;
      expect(sut()).toBe(8);
      ngMocks.change('[data-test="sutInput"]', 13);
      expect(sut()).toBe(15);
    });
    it('initially returns mapped value', () => {
      const source = mapSignal(1, (x) => x * 3);
      expect(source()).toBe(3);
    });
    it('#asReadonly returns a signal that reflects the original', () => {
      const source = mapSignal({ value: 1 }, (x) => ( { value: x.value * 3 }));
      const readOnly = source.asReadonly();
      expect(source()).toBe(readOnly());
      source.set({ value: 3 });
      expect(source()).toBe(readOnly());
    });
    it('#input returns signal containing input value', () => {
      const source = mapSignal(1, (x) => x * 3);
      expect(source.input()).toBe(1);
    });
    it('#set sets signal to mapped value', () => {
      const source = mapSignal(1, (x) => x * 3);
      source.set(2);
      expect(source()).toBe(6);
    });
    it('#update sets signal to mapped value', () => {
      const source = mapSignal(1, (x) => x * 3);
      source.update((x) => x + 5);
      expect(source()).toBe(18);
    });
    it('respects options.equal value', () => {
      const source = mapSignal(1, (x) => x + 1, { equal: (_, b) => b % 2 === 0 });
      source(); // this is a little dodgy, equal won't run if it doesn't think the signal is being listened to.
      source.set(3);
      expect(source()).toBe(2); // this should NOT change because of silly equal function.
      source.set(4);
      expect(source()).toBe(5);
    });
    it('changes value when signal inside selector changes value', () => {
      const selectorValue = signal(1);
      const source = mapSignal(1, (x) => x + selectorValue());
      selectorValue.set(5);
      expect(source()).toBe(6);
    });
  });
});
