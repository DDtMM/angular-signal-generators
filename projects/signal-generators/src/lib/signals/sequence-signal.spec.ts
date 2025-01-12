import { signal } from '@angular/core';
import { runComputedAndEffectTests, runDebugNameOptionTest, runDoesNotCauseReevaluationsSimplyWhenNested, runInjectorOptionTest, runTypeGuardTests } from '../../testing/common-signal-tests';
import { ERR_BOUNDS_EXCEEDED, ERR_ELEMENT_NOT_PRESENT, ERR_INVALID_SOURCE, ERR_NO_ELEMENTS, sequenceSignal } from './sequence-signal';
import { Cursor } from '../support/cursors/cursor';

describe('sequenceSignal', () => {

  describe('when array passed as first parameter', () => {
    /** A common source of values usable in each test. */
    let sequenceItems: number[];
    beforeEach(() => {
      sequenceItems = [Math.random(), 1 + Math.random(), 2 + Math.random()];
    });

    runDebugNameOptionTest((debugName) => sequenceSignal(sequenceItems, { debugName }));
    runTypeGuardTests(() => sequenceSignal(sequenceItems));
    runComputedAndEffectTests(() => {
      const sut = sequenceSignal(sequenceItems);
      return [sut, () => { sut.next() }];
    });
    runDoesNotCauseReevaluationsSimplyWhenNested(
      () => sequenceSignal(sequenceItems),
      (sut) => sut.next()
    );

    it('throws when trying to access empty array', () => {
      expect(() => sequenceSignal([])).toThrowError(ERR_NO_ELEMENTS);
    });
    it('will work with any ArrayLike object', () => {
      const sut = sequenceSignal('abcdefg');
      expect(sut()).toEqual('a');
      sut.next();
      expect(sut()).toEqual('b');
    });
    it('will work with iterables', () => {
      function *generator(): Generator<string> {
        yield 'cow';
        yield 'duck';
      }
      const sut = sequenceSignal(generator);
      expect(sut()).toEqual('cow');
      sut.next();
      expect(sut()).toEqual('duck');
    });
    it('will throw if passed non-iterable as source', () => {
      expect(() => sequenceSignal({} as any)).toThrowError(ERR_INVALID_SOURCE);
    });
    it('is initially the first value', () => {
      expect(sequenceSignal(sequenceItems)()).toEqual(sequenceItems[0]);
    });
    it('will move to the second value when next is called.', () => {
      const sequence = sequenceSignal(sequenceItems);
      sequence.next();
      expect(sequence()).toEqual(sequenceItems[1]);
    });
    it('will move forward based on the next parameter.', () => {
      const sequence = sequenceSignal(sequenceItems);
      sequence.next(2);
      expect(sequence()).toEqual(sequenceItems[2]);
    });
    it('will throw when moving past the last element and autoReset is off.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      expect(() => sequence.next(sequenceItems.length + 1)).toThrowError(ERR_BOUNDS_EXCEEDED);
    });
    it('will throw if at start and next is called with a negative number and autoResult is off.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      expect(() => sequence.next(-1)).toThrowError(ERR_BOUNDS_EXCEEDED);
    });
    it('will throw at end and next is called with a positive number and autoResult is off.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.next(sequenceItems.length - 1);
      expect(sequence()).toEqual(sequenceItems[sequenceItems.length - 1]);
      expect(() => sequence.next()).toThrowError(ERR_BOUNDS_EXCEEDED);
    });
    it('will loop when moving past the last element and autoReset is on (which is default).', () => {
      const sequence = sequenceSignal(sequenceItems);
      sequence.next(sequenceItems.length + 1);
      expect(sequence()).toEqual(sequenceItems[1]);
    });
    it('will move backwards when a negative value is passed to result.', () => {
      const sequence = sequenceSignal(sequenceItems);
      sequence.next(2);
      expect(sequence()).toEqual(sequenceItems[2]);
      sequence.next(-1);
      expect(sequence()).toEqual(sequenceItems[1]);
    });
    it('is the first value after reset', () => {
      const sequence = sequenceSignal(sequenceItems);
      sequence.next();
      sequence.reset();
      expect(sequence()).toEqual(sequenceItems[0]);
    });
    it('#next(0) will move to next if manually moved to not started position.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.next(0);
      expect(sequence()).toEqual(sequenceItems[0]);
    });
    it('#set will move cursor to the value if present in sequence', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.set(sequenceItems[1]);
      expect(sequence()).toEqual(sequenceItems[1]);
    });
    it('#set will throw if passed value is not present in sequence', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      expect(() => sequence.set(-5)).toThrowError(ERR_ELEMENT_NOT_PRESENT);
    });
    it('#update will move cursor to the value if present in sequence', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.update((_) => sequenceItems[1]);
      expect(sequence()).toEqual(sequenceItems[1]);
    });
    it('#update will throw if passed value is not present in sequence', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      expect(() => sequence.update(x => x * -1)).toThrowError(ERR_ELEMENT_NOT_PRESENT);
    });

  });

  describe('when signal passed as first parameter', () => {

    /** A common source of values usable in each test. */
    let sequenceItems: number[];
    beforeEach(() => {
      sequenceItems = [Math.random(), 1 + Math.random(), 2 + Math.random()];
    });
    runDebugNameOptionTest((debugName) => sequenceSignal(signal(sequenceItems), { debugName }));
    runInjectorOptionTest((injector) => sequenceSignal(signal(sequenceItems), { injector }));
    runTypeGuardTests(() => sequenceSignal(signal(sequenceItems)));

    runComputedAndEffectTests(() => {
      const source = signal(sequenceItems);
      const sut = sequenceSignal(source);
      return [sut, () => { source.set([3 + Math.random()]); sut.next(); }]; // only calling next will change the value
    });

    runDoesNotCauseReevaluationsSimplyWhenNested(
      () => {
        const source = signal(sequenceItems);
        const sut = sequenceSignal(source);
        // this is a rig to pass back the source so an emission can be triggered.
        return Object.assign(sut, { triggerChange: () => source.set([ 3 + Math.random() ])});
      },
      (sut) => {
        sut.triggerChange();
        sut.next(); // only calling next will change the value
      }
    );

    it('throws when trying to access empty array', () => {
      expect(() => sequenceSignal(signal([]))).toThrowError(ERR_NO_ELEMENTS);
    });

    it('will move to the first element of a new signal value when next is called.', () => {
      const sourceSignal = signal(sequenceItems);
      const nextArray = [3 + Math.random()];
      const sequence = sequenceSignal(sourceSignal);
      sequence.next();
      sourceSignal.set(nextArray);
      expect(sequence()).toBe(sequenceItems[1]);
      sequence.next();
      expect(sequence()).toBe(nextArray[0]);
    });

    it('will not throw an error if the next sequence is empty until next is called.', () => {
      const sourceSignal = signal(sequenceItems);
      const nextArray: number[] = [];
      const sequence = sequenceSignal(sourceSignal);
      sequence.next();
      sourceSignal.set(nextArray);
      expect(sequence()).toBe(sequenceItems[1]);
      expect(() => sequence.next()).toThrowError(ERR_BOUNDS_EXCEEDED);
    });
  });

  it('accepts Cursor as a parameter', () => {
    const cursor: Cursor<string> = {
      moveTo: (value) => ({ hasValue: true, value: value }),
      next: () => ({ hasValue: true, value: 'X' }),
      reset: () => undefined,
    };
    expect(sequenceSignal(cursor)).toBeTruthy();
  });
});
