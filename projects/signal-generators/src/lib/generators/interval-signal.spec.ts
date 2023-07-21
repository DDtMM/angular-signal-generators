import { fakeAsync, tick } from '@angular/core/testing';
import { intervalSignal } from './interval-signal';
import { MockRender } from 'ng-mocks';

describe('intervalSignal', () => {
  it('passes interval parameters to both parameters in timerSignal', fakeAsync(() => {
    const injector = MockRender().componentRef.injector;
    const options = { injector };
    const intervalTime = 5941;
    const intervalSource = intervalSignal(intervalTime, options);
    tick(intervalTime * 2);
    expect(intervalSource()).toBe(2);
    intervalSource.pause();
  }));
});
