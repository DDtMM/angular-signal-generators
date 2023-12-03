import { Injector, signal } from '@angular/core';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { Cursor, sequenceSignal } from './sequence-signal';
import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';

describe('sequenceSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  setupTypeGuardTests(() => sequenceSignal([1, 2, 3]));

  describe('when array passed as first parameter', () => {
    /** A common source of values usable in each test. */
    let sequenceItems: number[];
    beforeEach(() => {
      sequenceItems = [Math.random(), 1 + Math.random(), 2 + Math.random()];
    });

    setupComputedAndEffectTests(() => {
      const sut = sequenceSignal(sequenceItems);
      return [sut, () => { sut.next() }];
    }, () => fixture);

    it('throws when trying to access empty array', () => {
      expect(() => sequenceSignal([])).toThrowError();
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
    it('will return the last element when moving past the last element and autoReset is off.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.next(sequenceItems.length + 1);
      expect(sequence()).toEqual(sequenceItems[sequenceItems.length - 1]);
    });
    it('will not emit if at start and next is called with a negative number and autoResult is off.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.next(-1);
      expect(sequence()).toEqual(sequenceItems[0]);
    });
    it('will not emit if at end and next is called with a positive number and autoResult is off.', () => {
      const sequence = sequenceSignal(sequenceItems, { disableAutoReset: true });
      sequence.next(sequenceItems.length - 1);
      expect(sequence()).toEqual(sequenceItems[sequenceItems.length - 1]);
      sequence.next()
      expect(sequence()).toEqual(sequenceItems[sequenceItems.length - 1]);
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
      const sequence = sequenceSignal(sequenceItems);
      sequence.next(-1);
      sequence.next(0);
      expect(sequence()).toEqual(sequenceItems[0]);
    });
  });

  describe('when signal passed as first parameter', () => {
    /** A common source of values usable in each test. */
    let sequenceItems: number[];
    beforeEach(() => {
      sequenceItems = [Math.random(), 1 + Math.random(), 2 + Math.random()];
    });

    setupComputedAndEffectTests(() => {
      const source = signal(sequenceItems);
      const sut = sequenceSignal(source, { injector });
      return [sut, () => { source.set([3 + Math.random()]); fixture.detectChanges(); sut.next(); }]; // only calling next will change the value
    }, () => fixture);

    it('throws when trying to access empty array', () => {
      expect(() => sequenceSignal(signal([]))).toThrowError();
    });

    it('will move to the first element of a new signal value when next is called.', () => {
      const sourceSignal = signal(sequenceItems);
      const nextArray = [3 + Math.random()];
      const sequence = sequenceSignal(sourceSignal, { injector });
      sequence.next();
      sourceSignal.set(nextArray);
      fixture.detectChanges();
      expect(sequence()).toBe(sequenceItems[1]);
      sequence.next();
      expect(sequence()).toBe(nextArray[0]);
    });

    it('will not throw an error if the next sequence is empty.', () => {
      const sourceSignal = signal(sequenceItems);
      const nextArray: number[] = [];
      const sequence = sequenceSignal(sourceSignal, { injector });
      sequence.next();
      sourceSignal.set(nextArray);
      fixture.detectChanges();
      expect(sequence()).toBe(sequenceItems[1]);
      sequence.next();
      expect(sequence()).toBe(sequenceItems[1]);
    });
  });

  it('accepts Cursor as a parameter', () => {
    const cursor: Cursor<string> = {
      next: () => ({ hasValue: true, value: 'X' }),
      reset: () => undefined,
    };
    expect(sequenceSignal(cursor)).toBeTruthy();
  });
});
