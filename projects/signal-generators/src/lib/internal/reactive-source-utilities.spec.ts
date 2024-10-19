import { computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { isReactive, isReactiveSourceFunction, isToSignalInput } from './reactive-source-utilities';


describe('isReactive', () => {
  [
    { label: 'signal', value: signal(1) },
    { label: 'computed signal', value: computed(() => signal(1)) },
    { label: 'observable', value: new Observable((x) => x.complete()) },
    { label: 'function without arguments', value: () => '123' }
  ].forEach(({ label, value}) => {
    it(`returns true when passed a ${label}`, () => expect(isReactive(value)).toBeTrue())
  });

  [
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: 'a plain object', value: {} },
    { label: 'function with arguments', value: (x: number) => x + 1 }
  ].forEach(({ label, value}) => {
    it(`returns false when passed a ${label}`, () => expect(isReactive(value)).toBeFalse())
  });
});

describe('isReactiveSourceFunction', () => {
  it(`returns when passed a parameterless function that isn't a signal.`, () => expect(isReactiveSourceFunction(() => 1)).toBeTrue());

  [
    { label: 'null', value: null },
    { label: 'signal', value: undefined },
    { label: 'a plain object', value: {} },
    { label: 'a function with arguments', value: (x: number) => x++ }
  ].forEach(({ label, value}) => {
    it(`returns false when passed a ${label}`, () => expect(isReactiveSourceFunction(value)).toBeFalse());
  });
});

describe('isToSignalInput', () => {
  [
    { label: 'observable', value: new Observable((x) => x.complete()) },
    { label: 'object with subscribe function', value: { subscribe: () => 1 } }
  ].forEach(({ label, value}) => {
    it(`returns true when passed a ${label}`, () => expect(isToSignalInput(value)).toBeTrue());
  });

  [
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: 'a plain object', value: {} }
  ].forEach(({ label, value}) => {
    it(`returns false when passed a ${label}`, () => expect(isToSignalInput(value)).toBeFalse());
  });
});
