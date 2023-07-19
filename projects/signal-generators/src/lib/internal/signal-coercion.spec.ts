import { Injector, isSignal, signal } from '@angular/core';
import { MockRender } from 'ng-mocks';
import { BehaviorSubject, Subject } from 'rxjs';
import { coerceSignal } from './signal-coercion';

describe('coerceSignal', () => {

  it('should return the original source if it is a Signal', () => {
    const source = signal(generateValue());
    const coerced = coerceSignal(source);
    expect(source).toBe(coerced);
  });

  describe('when passed a function', () => {
    const originalValue = generateValue();
    const innerSignal = signal(originalValue);
    const coerced = coerceSignal(() => innerSignal() - 5);
    it('should return a new signal', () => expect(isSignal(coerced)).toBeTrue());
    it('and that signal should produce the expected value', () => expect(coerced() + 5).toBe(innerSignal()));
    it('and produce expected value when the source signal(s) change', () => {
      innerSignal.set(originalValue - 10);
      expect(innerSignal()).not.toEqual(originalValue);
      expect(coerced() + 5).toBe(innerSignal());
    });
  });

  describe('when passed an observable', () => {
    let injector: Injector;
    beforeEach(() => injector = MockRender().componentRef.injector);
    describe('and that observable emits immediately', () => {
      it('should return a signal that returns the value of the observable', () => {
        const source = new BehaviorSubject(generateValue());
        const coerced = coerceSignal(source, { injector });
        expect(coerced()).toBe(source.value);
        source.next(source.value - 10);
        expect(coerced()).toBe(source.value);
      })
    });
    describe('and that observable\'s first emission is deferred', () => {
      it('should throw if no initial value is passed.', () => {
        const source = new Subject<number>();
        expect(() => coerceSignal(source, { injector })).toThrow();
      });
      it('should return a signal if an initialValue is set in options', () => {
        const source = new Subject<number>();
        const initialValue = generateValue();
        const coerced = coerceSignal(source, { initialValue, injector });
        expect(coerced()).toBe(initialValue);
        const nextValue = generateValue();
        source.next(nextValue);
        expect(coerced()).toBe(nextValue);
      });
    });
  });
  function generateValue() {
    return Math.floor(Math.random()) * Number.MAX_SAFE_INTEGER;
  }
});


