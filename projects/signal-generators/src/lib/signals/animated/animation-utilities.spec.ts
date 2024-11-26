import { fakeAsync, flush } from '@angular/core/testing';
import { getRequestAnimationFrame } from './animation-utilities';
import { replaceGlobalProperty } from '../../../testing/testing-utilities';

describe('getRequestAnimationFrame', () => {
  it('returns globalThis.requestAnimationFrame if set', () => {
    // replace requestAnimationFrame with custom function.
    const restoreProperty = replaceGlobalProperty('requestAnimationFrame',
      (fn: (x: number) => void) => { fn(Date.now()); return  0; });
    const getRafResult = getRequestAnimationFrame();
    expect(getRafResult).toBe(globalThis.requestAnimationFrame);
    let isCalledBack = false;
    getRafResult(() => isCalledBack = true);
    expect(isCalledBack).toBe(true);
    restoreProperty();
  });

  it('uses timeout when globalThis.requestAnimationFrame is missing', fakeAsync(() => {
    const restoreProperty = replaceGlobalProperty('requestAnimationFrame', undefined);
    const getRafResult = getRequestAnimationFrame();
    expect(getRafResult).not.toBe(globalThis.requestAnimationFrame);
    let isCalledBack = false;
    getRafResult(() => isCalledBack = true);
    flush();
    expect(isCalledBack).toBe(true);
    restoreProperty();
  }));

})
