import { isSignal, signal } from '@angular/core';
import { refSignal } from './ref-signal';

describe('refSignal', () => {
  it('should create a signal', () => {
    expect(isSignal(refSignal(signal(1)))).toBeTruthy();
  });
});
