import { isSignal } from '@angular/core';
import { coerceSignal } from './signal-coercion';

describe('refSignal', () => {
  it('should convert a function into a signal', () => {
    expect(isSignal(coerceSignal(() => ''))).toBeTruthy();
  });
});
