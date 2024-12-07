import { computed, Injector, Signal, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import {
  runComputedAndEffectTests,
  runDebugNameOptionTest,
  runDoesNotCauseReevaluationsSimplyWhenNested,
  runInjectorOptionTest,
  runTypeGuardTests
} from '../../testing/common-signal-tests';
import { nestSignal } from './nest-signal';


describe('nestSignal', () => {

  describe('when created as writable signal', () => {
    runDebugNameOptionTest((debugName) => nestSignal({ a: signal(1) }, { debugName }));
    runInjectorOptionTest((injector) => nestSignal({ a: signal(1) }, { injector }));
    runTypeGuardTests(() => nestSignal({ a: signal(1) }));

    describe('common tests', () => {
      runComputedAndEffectTests(() => {
        const sut = nestSignal({ a: signal(1) });
        return [sut, () => sut.set({ a: signal(2) })]
      });
      runDoesNotCauseReevaluationsSimplyWhenNested(
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

  describe('recursion tests', () => {
    it('processes recursive arrays without an infinite loop', () => {
      const problematicItem: unknown[] = [signal(5)];
      problematicItem.push(problematicItem);
      const problematicSignal = signal(problematicItem);
      const expected: unknown[] = [5];
      expected.push(expected);
      const sut = nestSignal(problematicSignal);
      expect(sut()).toEqual(expected);
    });

    it('processes recursive Map without an infinite loop', () => {
      const problematicItem: Map<unknown, unknown> = new Map([['notRecursive', signal(5)]]);
      problematicItem.set('recursive', problematicItem);
      const problematicSignal = signal(problematicItem);
      const expected: [string, unknown][] = [['notRecursive', 5]];
      expected.push(['recursive', expected]);
      const sut = nestSignal(problematicSignal);
      expect(sut()).toEqual(expected);
    });
    it('processes recursive objects without an infinite loop', () => {
      const problematicItem: Record<string, unknown> = { notRecursive: signal(5) };
      problematicItem['recursive'] = problematicItem;
      const problematicSignal = signal(problematicItem);
      const expected: Record<string, unknown> = { notRecursive: 5 };
      expected['recursive'] = expected
      const sut = nestSignal(problematicSignal);
      expect(sut()).toEqual(expected);
    });
    it('processes recursive Sets without an infinite loop', () => {
      const problematicItem: Set<unknown> = new Set([signal(5)]);
      problematicItem.add(problematicItem);
      const problematicSignal = signal(problematicItem);
      const expected: unknown[] = [5];
      expected.push(expected);
      const sut = nestSignal(problematicSignal);
      expect(sut()).toEqual(expected);
    });
    it('processes recursive signals without an infinite loop', () => {
      const problematicItem: unknown[] = [signal(5)];
      problematicItem.push(signal(problematicItem));
      const problematicSignal = signal(problematicItem);
      const expected: unknown[] = [5];
      expected.push(expected);
      const sut = nestSignal(problematicSignal);
      expect(sut()).toEqual(expected);
    });
  })
  describe('when created as readonly signal', () => {
    describe('common tests', () => {
      let $nested: WritableSignal<number>;
      beforeEach(() => ($nested = signal(1)));
      runComputedAndEffectTests(() => [
        nestSignal(signal({ a: $nested })),
        () => $nested.set(Math.random())
      ]);
      runDoesNotCauseReevaluationsSimplyWhenNested(
        () => nestSignal(signal({ a: $nested })),
        () => $nested.set(2)
      );
    });
    runDebugNameOptionTest((debugName) => nestSignal(signal({ a: signal(1) }), { debugName }));
    runInjectorOptionTest((injector) => nestSignal(signal({ a: signal(1) }), { injector }));
    runTypeGuardTests(() => nestSignal(signal({ a: signal(1) })));

    it('uses equal function from options', () => {
      const inner = signal(1);
      const sut = nestSignal(signal({ a: inner }), { equal: (a, b) => a.a % 2 === b.a % 2 });
      sut(); // force evaluation.
      inner.set(3);
      expect(sut()).toEqual({ a: 1 }); // the value is not updated because the equal function returned true.
    });

    it('can use a Subscribable as a source if an injector is passed in options when not in an injection context.', () => {
      const inner = signal(1);
      const nest = new BehaviorSubject({ a: inner });
      const sut = nestSignal(nest, { injector: TestBed.inject(Injector) });
      inner.set(3);
      expect(sut()).toEqual({ a: 3 });
    });

    it('is updated when a root signal changes', () => {
      const source = signal(1);
      const sut = nestSignal(source);
      source.set(12);
      expect(sut()).toEqual(12);
    });

    it('is updated when a signal nested in a object changes', () => {
      const source = { a: signal(1), b: signal(2) };
      const sut = nestSignal(signal(source));
      source.a.set(7);
      expect(sut()).toEqual({ a: 7, b: 2 });
    });

    it('is updated when a signal nested in an array changes', () => {
      const source = [signal(1), signal(12)];
      const sut = nestSignal(signal(source));
      source[0].set(14);
      expect(sut()).toEqual([14, 12]);
    });

    it('is updated when a signal inside a signal changes', () => {
      const source = [signal({ inner: signal('X') })];
      const sut = nestSignal(signal(source));
      source[0]().inner.set('Y');
      expect(sut()).toEqual([{ inner: 'Y' }]);
    });

    it('is updated when a signal is added to an array of signals and the new signal changes', () => {
      const source = [signal({ inner: [signal(1)] }, { debugName: 'source' })];
      const sut = nestSignal(source);
      source[0].update((x) => ({ ...x, inner: [...x.inner, signal(5)] }));
      expect(sut()).toEqual([{ inner: [1, 5] }]);
      source[0]().inner[1].set(7);
      expect(sut()).toEqual([{ inner: [1, 7] }]);
    });
    it('caches objects and reuses their denested values', () => {
      const duplicateObject = { someValue: signal(6) };
      const source = [signal(duplicateObject), signal(duplicateObject)];
      const sut = nestSignal(signal(source));
      expect(sut()[0]).toBe(sut()[1]);
    });
    it('can do crazy things', () => {
      const $count = signal(0);
      const $text = signal('hello');
      const $why = signal({ count: computed(() => $count() + 1), text: [$text] });
      const $sut = nestSignal(signal({ count: $count, text: $text, why: $why }));
      expect($sut()).toEqual({ count: 0, text: 'hello', why: { count: 1, text: ['hello'] } });
      $count.set(1);
      expect($sut()).toEqual({ count: 1, text: 'hello', why: { count: 2, text: ['hello'] } });
    });
  });

  describe('simple value conversions', () => {
    it('converts a signal to its value', () => expect(nestSignal(signal({ a: 1 }))()).toEqual({ a: 1 }));
    it('converts a Date to itself', () => {
      const value = new Date(2001, 1, 1);
      expect(nestSignal(value)()).toBe(value);
    });
    it('converts an array of primitives to an array of equal values', () => expect(nestSignal([1, 2, 3])()).toEqual([1, 2, 3]));
    it('converts a set to an iterable of equal values', () => expect(nestSignal(new Set([1, 2, 3]))()).toEqual([1, 2, 3]));
    it('converts a map to an array of key value pairs', () => {
      const value = new Map<string | symbol, number>([['a', 1], ['b', 2], [Symbol.iterator, 3]]);
      expect(nestSignal(value)()).toEqual([['a', 1], ['b', 2], [Symbol.iterator, 3]]);
    });
    it('converts a built in primitive to itself', () => {
      const value = 'test';
      expect(nestSignal(value)()).toBe(value);
    });
    it('converts an object to itself', () => expect(nestSignal({ a: 1 })()).toEqual({ a: 1 }));
  });

  describe('Conversions from Map', () => {
    it('converts a key that is a signal to its value and listens to changes', () => {
      const $key = signal('x');
      const value = new Map([[$key, 'y']]);
      const sut = nestSignal(value);
      expect(sut()).toEqual([['x', 'y']]);
      $key.set('z');
      expect(sut()).toEqual([['z', 'y']]);
    });
  });

});
