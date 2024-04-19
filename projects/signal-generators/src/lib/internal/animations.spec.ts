import { fakeAsync, flush } from '@angular/core/testing';
import { getRequestAnimationFrame } from './animations';

describe('getRequestAnimationFrame', () => {
  it('returns globalThis.requestAnimationFrame if set', () => {
    // replace requestAnimationFrame with custom function.
    const raf = globalThis.requestAnimationFrame;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.requestAnimationFrame = ((fn: (x: number) => void) => { fn(Date.now()); return  0; }) as any;
    const getRafResult = getRequestAnimationFrame();
    expect(getRafResult).toBe(globalThis.requestAnimationFrame);

    let isCalledBack = false;
    getRafResult(() => isCalledBack = true);
    expect(isCalledBack).toBe(true);
    // restore raf.
    globalThis.requestAnimationFrame = raf;
  });

  it('uses timeout when globalThis.requestAnimationFrame is missing', fakeAsync(() => {
    // replace requestAnimationFrame with undefined.
    const raf = globalThis.requestAnimationFrame;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.requestAnimationFrame = undefined as any;
    const getRafResult = getRequestAnimationFrame();
    expect(getRafResult).not.toBe(globalThis.requestAnimationFrame);

    let isCalledBack = false;
    getRafResult(() => isCalledBack = true);
    flush();
    expect(isCalledBack).toBe(true);
    // restore raf
    globalThis.requestAnimationFrame = raf;
  }));

})
