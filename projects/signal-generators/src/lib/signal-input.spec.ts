import { computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { isSignalInput, isToSignalInput } from './signal-input';

describe('isSignalInput', () => {
  [
    { label: 'signal', value: signal(1) },
    { label: 'computed signal', value: computed(() => signal(1)) },
    { label: 'observable', value: new Observable((x) => x.complete()) },
    { label: 'function without arguments', value: () => '123' }
  ].forEach(({ label, value}) => {
    it(`returns true when passed a ${label}`, () => expect(isSignalInput(value)).toBeTrue())
  });

  [
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: 'a plain object', value: {} },
    { label: 'function with arguments', value: (x: number) => x + 1 }
  ].forEach(({ label, value}) => {
    it(`returns false when passed a ${label}`, () => expect(isSignalInput(value)).toBeFalse())
  });
});

describe('isToSignalInput', () => {
  [
    { label: 'observable', value: new Observable((x) => x.complete()) },
    { label: 'object with subscribe function', value: { subscribe: () => 1 } }
  ].forEach(({ label, value}) => {
    it(`returns true when passed a ${label}`, () => expect(isToSignalInput(value)).toBeTrue())
  });

  [
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: 'a plain object', value: {} }
  ].forEach(({ label, value}) => {
    it(`returns false when passed a ${label}`, () => expect(isToSignalInput(value)).toBeFalse())
  });
});
