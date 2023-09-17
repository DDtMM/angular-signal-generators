import { signal } from '@angular/core';
import { toSignalProxy } from './to-signal-proxy';

describe('signalProxy', () => {

  it('should return an object with all of the function keys of a signal', () => {
    const source = signal(1);
    const proxy = toSignalProxy(source);
    Object.keys(source).forEach(key => expect(key in proxy).toBe(true));
  });
  it('should get the source\'s value when calling it as a function', () => {
    const source = signal(1);
    const proxy = toSignalProxy(source);
    expect(proxy()).toEqual(1);
  });
});


