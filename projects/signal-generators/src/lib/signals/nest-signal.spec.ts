import { computed, Injector, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import {
  setupComputedAndEffectTests,
  setupDoesNotCauseReevaluationsSimplyWhenNested,
  setupTypeGuardTests
} from '../../testing/common-signal-tests.spec';
import { nestSignal } from './nest-signal';

describe('nestSignal', () => {
  setupTypeGuardTests(() => nestSignal({ a: 1 }));

  describe('simple results', () => {
    it('converts a signal to its value', () => expect(nestSignal(signal({ a: 1 }))()).toEqual({ a: 1 }));
    it('converts a Date to itself', () => expect(nestSignal(new Date(2001, 1, 1))()).toEqual(new Date(2001, 1, 1)));
    it('converts an array of primitives to itself', () => expect(nestSignal([1, 2, 3])()).toEqual([1, 2, 3]));
    it('converts a primitive to itself', () => expect(nestSignal('test')()).toEqual('test'));
    it('converts an object to itself', () => expect(nestSignal({ a: 1 })()).toEqual({ a: 1 }));
  });
  describe('when created as writable signal', () => {
    describe('common tests', () => {
      setupComputedAndEffectTests(() => {
        const sut = nestSignal({ a: signal(1) });
        return [sut, () => sut.set({ a: signal(2) })]
      });
      setupDoesNotCauseReevaluationsSimplyWhenNested(
        () => nestSignal({ a: signal(1) }),
        (sut) => sut.set({ a: signal(2) })
      );
    });

    it('updates its value accordingly inner signal changes', () => {
      const source = signal(1);
      const sut = nestSignal({ a: source });
      expect(sut()).toEqual({ a: 1 });
      source.set(2);
      expect(sut()).toEqual({ a: 2 });
    });

    it('updates its value from set', () => {
      const sut = nestSignal({ a: signal('x') });
      expect(sut()).toEqual({ a: 'x' });
      sut.set({ a: signal('y') });
      expect(sut()).toEqual({ a: 'y' });
    });

    it('updates its value from update', () => {
      const sut = nestSignal([ signal('x'), signal('y') ]);
      expect(sut()).toEqual([ 'x', 'y' ]);
      sut.update(x => [ signal('z'), x[1] ]);
      expect(sut()).toEqual([ 'z', 'y' ]);
    });

    it('returns a readonly signal that reflects its value from asReadonly', () => {
      const sut = nestSignal([signal(1)]);
      const $readonly = sut.asReadonly();
      expect('set' in $readonly).toBe(false);
      expect('updated' in $readonly).toBe(false);
      expect($readonly()).toEqual([1]);
      sut.set([signal(2)]);
      expect($readonly()).toEqual([2]);
    });
  });

  describe('when created as readonly signal', () => {
    describe('common tests', () => {
      let $nested: WritableSignal<number>;
      beforeEach(() => ($nested = signal(1)));
      setupComputedAndEffectTests(() => [
        nestSignal({ a: $nested }),
        () => $nested.set(Math.random())
      ]);
      setupDoesNotCauseReevaluationsSimplyWhenNested(
        () => nestSignal({ a: $nested }),
        () => $nested.set(2)
      );
    });

    it('uses equal function from options', () => {
      const source = signal(1);
      const sut = nestSignal({ a: source }, { equal: (a, b) => a.a % 2 === b.a % 2 });
      sut(); // force evaluation.
      source.set(3);
      expect(sut()).toEqual({ a: 1 }); // the value is not updated because the equal function returned true.
    });

    it('can use a Subscribable as a source if an injector is passed in options when not in an injection context.', () => {
      const source = signal(1);
      const nest = new BehaviorSubject({ a: source });
      const sut = nestSignal(nest, { injector: TestBed.inject(Injector) });
      source.set(3);
      expect(sut()).toEqual({ a: 3 });
    });

    it('uses equal function from options', () => {
      const source = signal(1);
      const sut = nestSignal({ a: source }, { equal: (a, b) => a.a % 2 === b.a % 2 });
      sut(); // force evaluation.
      source.set(3);
      expect(sut()).toEqual({ a: 1 }); // the value is not updated because the equal function returned true.
    });

    it('is updated when a root signal changes', () => {
      const source = signal(1);
      const sut = nestSignal(source);
      source.set(12);
      expect(sut()).toEqual(12);
    });

    it('is updated when a signal nested in a object changes', () => {
      const source = { a: signal(1), b: signal(2) };
      const sut = nestSignal(source);
      source.a.set(7);
      expect(sut()).toEqual({ a: 7, b: 2 });
    });

    it('is updated when a signal nested in an array changes', () => {
      const source = [signal(1), signal(12)];
      const sut = nestSignal(source);
      source[0].set(14);
      expect(sut()).toEqual([14, 12]);
    });

    it('is updated when a signal inside a signal changes', () => {
      const source = [signal({ inner: signal('X') })];
      const sut = nestSignal(source);
      source[0]().inner.set('Y');
      expect(sut()).toEqual([{ inner: 'Y' }]);
    });

    it('is updated when a signal is added to an array of signals and the new signal changes', () => {
      const source = [signal({ inner: [signal(1)] })];
      const sut = nestSignal(source);
      source[0].update((x) => ({ ...x, inner: [...x.inner, signal(5)] }));
      expect(sut()).toEqual([{ inner: [1, 5] }]);
      source[0]().inner[1].set(7);
      expect(sut()).toEqual([{ inner: [1, 7] }]);
    });

    it('can do crazy things', () => {
      const $count = signal(0);
      const $text = signal('hello');
      const $why = signal({ count: computed(() => $count() + 1), text: [$text] });
      const $sut = nestSignal({ count: $count, text: $text, why: $why });
      expect($sut()).toEqual({ count: 0, text: 'hello', why: { count: 1, text: ['hello'] } });
      $count.set(1);
      expect($sut()).toEqual({ count: 1, text: 'hello', why: { count: 2, text: ['hello'] } });
    });
  });
});
