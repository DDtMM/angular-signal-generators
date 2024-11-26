import { fakeAsync, TestBed } from '@angular/core/testing';
import { tickAndAssertValues, tickAndRecordValues } from '../../../testing/testing-utilities';
import { springSignal } from './spring-signal';

describe('springSignal', () => {
  it('returns a signal whose animations are unclamped, having a damping of 3, no delay,a precision of 0.01 and a stiffness of 100 when no options are passed', fakeAsync(() => {
    // in order to test this we need to record expected results when the options are explicity set, and then compare the results when no options are passed.
    const control = TestBed.runInInjectionContext(() => springSignal(1, { damping: 3, delay: 0, precision: 0.01, stiffness: 100 }));
    control.set(5);
    const expected  = [[0, 1], ...tickAndRecordValues(() => control(), [100, 100, 100, 100, 100, 100, 100, 100])] as const;
    const sut = TestBed.runInInjectionContext(() => springSignal(1));
    sut.set(5);
    tickAndAssertValues(() => sut(), expected);
  }));
  it('will reach an end state eventually', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => springSignal(1, {  clamp: false, damping: 3, stiffness: 50 }));
    sut.set(5);
    tickAndAssertValues(() => sut(), [[10000, 5]])
  }));
  it('can exceed destination values when clamp is false', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => springSignal(1, {  clamp: false, damping: 3, stiffness: 1000 }));
    sut.set(5);
    const values = tickAndRecordValues(() => sut(), new Array(30).fill(10));
    expect(values.find(([_, value]) => value > 5)).toBeDefined();
  }));
  it('does not exceed start and destination values when clamp is true', fakeAsync(() => {
    const sut = TestBed.runInInjectionContext(() => springSignal(0, {  clamp: true, damping: 3, stiffness: 1000}));
    sut.set(1);
    tickAndRecordValues(() => sut(), [0, 50, 50, 50, 50, 50, 50])
      .forEach(([_, value]) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
  }));

});
