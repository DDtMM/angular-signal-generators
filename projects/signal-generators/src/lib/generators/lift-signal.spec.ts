import { signal } from '@angular/core';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { liftSignal } from './lift-signal';

class DummyClass {
  constructor(public value: number) { }

  /** for testing mutations */
  double(): void {
    this.value *= 2;
  }
  triple(): void {
    this.value *= 3;
  }
  /** for testing updated */
  getQuad(): DummyClass {
    return new DummyClass(this.value * 4);
  }
}

describe('liftSignal', () => {
  setupTypeGuardTests(() => liftSignal([1, 2, 3], []));

  it('initially returns the initial value', () => {
    const src = liftSignal([1, 2, 3], []);
    expect(src()).toEqual([1, 2, 3]);
  });

  [
    { factory: () => new DummyClass(5), label: 'object' },
    { factory: () => signal(new DummyClass(5)), label: 'object signal' }
  ].forEach(({ factory, label }) => {
    describe('mutators', () => {
      setupComputedAndEffectTests(() => {
        const sut = liftSignal(factory(), null, ['double']);
        return [sut, () => { sut.double(); }];
      });

      it(`adds methods from a passed ${label} that mutate the value when called`, () => {
        const src = liftSignal(factory(), null, ['double', 'triple']);
        src.double()
        expect(src()).toEqual(new DummyClass(10));
        src.triple()
        expect(src()).toEqual(new DummyClass(30));
      });
    });
    describe('updaters', () => {

      setupComputedAndEffectTests(() => {
        const sut = liftSignal(factory(), ['getQuad']);
        return [sut, () => { sut.getQuad(); }];
      });

      it(`adds methods from a passed ${label} that update the value when called`, () => {
        const src = liftSignal(factory(), ['getQuad']);
        src.getQuad();
        expect(src()).toEqual(new DummyClass(20));
      });
    });

  });

  [
    { factory: () => [1, 2, 3], label: 'array' },
    { factory: () => signal([1, 2, 3]), label: 'array signal' }
  ].forEach(({ factory, label }) => {
    describe('mutators', () => {
      setupComputedAndEffectTests(() => {
        const sut = liftSignal(factory(), null, ['push']);
        return [sut, () => { sut.push(5); }];
      });

      it(`adds methods from a passed ${label} that mutate the value when called`, () => {
        const src = liftSignal(factory(), ['concat'], ['push', 'pop', 'shift']);
        src.push(4);
        expect(src()).toEqual([1, 2, 3, 4]);
        src.pop();
        expect(src()).toEqual([1, 2, 3]);
        src.shift();
        expect(src()).toEqual([2, 3]);
        src.concat([4, 5]);
        expect(src()).toEqual([2, 3, 4, 5]);
      });
    });
    describe('updaters', () => {
      setupComputedAndEffectTests(() => {
        const sut = liftSignal(factory(), ['concat']);
        return [sut, () => { sut.concat([5]); }];
      });

      it(`adds methods from a passed ${label} that update the value when called`, () => {
        const src = liftSignal(factory(), ['filter']);
        src.filter(x => x === 2);
        expect(src()).toEqual([2]);
      });
    });

  });

});
