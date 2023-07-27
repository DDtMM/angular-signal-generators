import { Injector, signal } from '@angular/core';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { Cursor, sequenceSignal } from './sequence-signal';

describe('sequenceSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  describe('when array passed as first parameter', () => {
    let source: number[];
    beforeEach(() => {
      source = [Math.random(), 1 + Math.random(), 2 + Math.random()];
    });
    it('throws when trying to access empty array', () => {
      expect(() => sequenceSignal([])).toThrowError();
    });
    it('is initially the first value', () => {
      expect(sequenceSignal(source)()).toEqual(source[0]);
    });
    it('will move to the second value when next is called.', () => {
      const sequence = sequenceSignal(source);
      sequence.next();
      expect(sequence()).toEqual(source[1]);
    });
    it('will move forward based on the next parameter.', () => {
      const sequence = sequenceSignal(source);
      sequence.next(2);
      expect(sequence()).toEqual(source[2]);
    });
    it('will return the last element when moving past the last element and autoReset is off.', () => {
      const sequence = sequenceSignal(source, { disableAutoReset: true });
      sequence.next(source.length + 1);
      expect(sequence()).toEqual(source[source.length - 1]);
    });
    it('will not emit if at start and next is called with a negative number and autoResult is off.', () => {
      const sequence = sequenceSignal(source, { disableAutoReset: true });
      sequence.next(-1);
      expect(sequence()).toEqual(source[0]);
    });
    it('will not emit if at end and next is called with a positive number and autoResult is off.', () => {
      const sequence = sequenceSignal(source, { disableAutoReset: true });
      sequence.next(source.length - 1);
      expect(sequence()).toEqual(source[source.length - 1]);
      sequence.next()
      expect(sequence()).toEqual(source[source.length - 1]);
    });
    it('will loop when moving past the last element and autoReset is on (which is default).', () => {
      const sequence = sequenceSignal(source);
      sequence.next(source.length + 1);
      expect(sequence()).toEqual(source[1]);
    });
    it('will move backwards when a negative value is passed to result.', () => {
      const sequence = sequenceSignal(source);
      sequence.next(2);
      expect(sequence()).toEqual(source[2]);
      sequence.next(-1);
      expect(sequence()).toEqual(source[1]);
    });
    it('is the first value after reset', () => {
      const sequence = sequenceSignal(source);
      sequence.next();
      sequence.reset();
      expect(sequence()).toEqual(source[0]);
    });
  });

  describe('when signal passed as first parameter', () => {
    it('throws when trying to access empty array', () => {
      expect(() => sequenceSignal(signal([]))).toThrowError();
    });

    it('will move to the first element of a new signal value when next is called.', () => {
      const sourceArray = [Math.random(), 1 + Math.random(), 2 + Math.random()];
      const sourceSignal = signal(sourceArray);
      const nextArray = [3 + Math.random()];
      const sequence = sequenceSignal(sourceSignal, { injector });
      sequence.next();
      sourceSignal.set(nextArray);
      fixture.detectChanges();
      expect(sequence()).toBe(sourceArray[1]);
      sequence.next();
      expect(sequence()).toBe(nextArray[0]);
    });

    it('will not throw an error if the next sequence source.', () => {
      const sourceArray = [Math.random(), 1 + Math.random(), 2 + Math.random()];
      const sourceSignal = signal(sourceArray);
      const nextArray: number[] = [];
      const sequence = sequenceSignal(sourceSignal, { injector });
      sequence.next();
      sourceSignal.set(nextArray);
      fixture.detectChanges();
      expect(sequence()).toBe(sourceArray[1]);
      sequence.next();
      expect(sequence()).toBe(sourceArray[1]);
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
