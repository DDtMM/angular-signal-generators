import { fakeAsync, flush } from '@angular/core/testing';
import { EASING_NAMES, getEasingFn, getRequestAnimationFrame } from './animations';

describe('getEasingFn', () => {

  EASING_NAMES.forEach((easingName) => {
    it(`should return an easing function when passed ${easingName}`, () => {
      const fn = getEasingFn(easingName);
      expect(fn(.5)).toBeDefined();
    });
  })

});

describe('getRequestAnimationFrame', () => {
  it('returns window.requestAnimationFrame if set', () => {
    // replace requestAnimationFrame with custom function.
    const raf = window.requestAnimationFrame;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.requestAnimationFrame = ((fn: (x: number) => void) => { fn(Date.now()); return  0; }) as any;
    const getRafResult = getRequestAnimationFrame();
    expect(getRafResult).toBe(window.requestAnimationFrame);

    let isCalledBack = false;
    getRafResult(() => isCalledBack = true);
    expect(isCalledBack).toBe(true);
    // restore raf.
    window.requestAnimationFrame = raf;
  });

  it('uses timeout when window.requestAnimationFrame is missing', fakeAsync(() => {
    // replace requestAnimationFrame with undefined.
    const raf = window.requestAnimationFrame;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.requestAnimationFrame = undefined as any;
    const getRafResult = getRequestAnimationFrame();
    expect(getRafResult).not.toBe(window.requestAnimationFrame);

    let isCalledBack = false;
    getRafResult(() => isCalledBack = true);
    flush();
    expect(isCalledBack).toBe(true);
    // restore raf
    window.requestAnimationFrame = raf;
  }));

})
