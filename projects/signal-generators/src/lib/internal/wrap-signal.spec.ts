import { signal } from '@angular/core';
import { wrapSignal } from './wrap-signal';

describe('wrapSignal', () => {
  it('binds members from an object', () => {
    const value = wrapSignal(signal(1), { test: () => 'res'});
    expect(value.test()).toBe('res');
  });
  it('binds members from a factory function that creates an object', () => {
    const value = wrapSignal(signal(1), () => ({ test: () => 'res' }));
    expect(value.test()).toBe('res');
  });
  it('provides the wrapper signal when a factory function is used', () => {
    const value = wrapSignal(signal(1), (wrapper) => ({ getWrapper: () => wrapper }));
    expect(value.getWrapper()).toBe(value);
  });
  it('changes its value when the source signal value changes', () => {
    const source = signal(1);
    const value = wrapSignal(source, { test: () => 'res'});
    source.set(2);
    expect(value()).toBe(2);
  });
});
