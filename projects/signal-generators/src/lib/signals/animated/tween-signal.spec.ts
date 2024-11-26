import { fakeAsync, TestBed } from '@angular/core/testing';
import { easeOutQuart } from '../../../../easings/src/easings';
import { tickAndAssertValues } from '../../../testing/testing-utilities';
import { tweenSignal } from './tween-signal';

describe('tweenSignal', () => {
  it('returns a linearly animated value with no delay and a duration of 400 when no options are passed', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => tweenSignal(1));
    sut.set(5);
    tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 3], [200, 5]]);
  }));
  it('returns an eased value when easing is passed as an option', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { easing: easeOutQuart, duration: 500 }));
    sut.set(5);
    tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
  }));
  it('completes after the first effect callback when duration is 0', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { easing: easeOutQuart, duration: 0 }));
    sut.set(5);
    tickAndAssertValues(() => Math.round(sut()), [[0, 5]]);
  }));
  it('returns an eased value when easing is passed  to setOption', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
    sut.setOptions({ easing: easeOutQuart });
    sut.set(5);
    tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
  }));
  it('returns an eased value when easing is passed as an option to set', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => tweenSignal(1, { duration: 500 }));
    sut.set(5, { easing: easeOutQuart });
    tickAndAssertValues(() => Math.round(sut()), [[0, 1], [200, 4], [300, 5]]);
  }));


});
