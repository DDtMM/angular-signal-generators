import { signal } from '@angular/core';
import { setupComputedAndEffectTests, setupDoesNotCauseReevaluationsSimplyWhenNested, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
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
    const sut = liftSignal([1, 2, 3], []);
    expect(sut()).toEqual([1, 2, 3]);
  });

  it('should use custom clone function when passed in options', () => {
    const sut = liftSignal(new DummyClass(1), null, ['double', 'triple'], { cloneFn: (x) => new DummyClass(x.value * -1)});
    sut.double();
    expect(sut()).toEqual(new DummyClass(-2));
  });

  setupDoesNotCauseReevaluationsSimplyWhenNested(
    () => liftSignal([1, 2, 3], ['map']),
    (sut) => sut.map(x => x + 2)
  );

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
        const sut = liftSignal(factory(), null, ['double', 'triple']);
        sut.double()
        expect(sut()).toEqual(new DummyClass(10));
        sut.triple()
        expect(sut()).toEqual(new DummyClass(30));
      });
    });
    describe('updaters', () => {

      setupComputedAndEffectTests(() => {
        const sut = liftSignal(factory(), ['getQuad']);
        return [sut, () => { sut.getQuad(); }];
      });

      it(`adds methods from a passed ${label} that update the value when called`, () => {
        const sut = liftSignal(factory(), ['getQuad']);
        sut.getQuad();
        expect(sut()).toEqual(new DummyClass(20));
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
        const sut = liftSignal(factory(), ['concat'], ['push', 'pop', 'shift']);
        sut.push(4);
        expect(sut()).toEqual([1, 2, 3, 4]);
        sut.pop();
        expect(sut()).toEqual([1, 2, 3]);
        sut.shift();
        expect(sut()).toEqual([2, 3]);
        sut.concat([4, 5]);
        expect(sut()).toEqual([2, 3, 4, 5]);
      });
    });
    describe('updaters', () => {
      setupComputedAndEffectTests(() => {
        const sut = liftSignal(factory(), ['concat']);
        return [sut, () => { sut.concat([5]); }];
      });

      it(`adds methods from a passed ${label} that update the value when called`, () => {
        const sut = liftSignal(factory(), ['filter']);
        sut.filter(x => x === 2);
        expect(sut()).toEqual([2]);
      });
    });

  });

});
