import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  runComputedAndEffectTests,
  runDebugNameOptionTest,
  runInjectorOptionTest,
  runTypeGuardTests
} from '../../testing/common-signal-tests';
import { throttleSignal } from './throttle-signal';

describe('throttleSignal', () => {
  describe('when created with a signal', () => {
    runDebugNameOptionTest((debugName) => throttleSignal(signal(1), 500, { debugName }));
    runInjectorOptionTest((injector) => throttleSignal(signal(1), 500, { injector }));
    runTypeGuardTests(() => throttleSignal(signal(1), 500));
    runComputedAndEffectTests(() => {
      const source = signal(1);
      return [throttleSignal(source, 500), () => source.set(2)];
    });

    it('initially shows the source value', () => {
      const source = signal(1);
      const sut = TestBed.runInInjectionContext(() => throttleSignal(source, 500));
      expect(sut()).toBe(1);
    });

    it('emits the leading and latest trailing values', fakeAsync(() => {
      const source = signal(1);
      const sut = TestBed.runInInjectionContext(() => throttleSignal(source, 500));
      source.set(2);
      TestBed.tick();
      expect(sut()).toBe(2);
      source.set(3);
      TestBed.tick();
      tick(499);
      expect(sut()).toBe(2);
      tick(1);
      expect(sut()).toBe(3);
    }));

    it('supports trailing-only throttling', fakeAsync(() => {
      const source = signal(1);
      const sut = TestBed.runInInjectionContext(() => throttleSignal(source, 500, { leading: false }));
      source.set(2);
      TestBed.tick();
      expect(sut()).toBe(1);
      tick(500);
      expect(sut()).toBe(2);
    }));

    it('supports leading-only throttling', fakeAsync(() => {
      const source = signal(1);
      const sut = TestBed.runInInjectionContext(() => throttleSignal(source, 500, { trailing: false }));
      source.set(2);
      TestBed.tick();
      source.set(3);
      TestBed.tick();
      tick(500);
      expect(sut()).toBe(2);
      source.set(4);
      TestBed.tick();
      expect(sut()).toBe(4);
    }));

    it('adjusts an active period when throttle time changes', fakeAsync(() => {
      const source = signal(1);
      const duration = signal(500);
      const sut = TestBed.runInInjectionContext(() => throttleSignal(source, duration));
      source.set(2);
      TestBed.tick();
      source.set(3);
      TestBed.tick();
      tick(100);
      duration.set(200);
      TestBed.tick();
      tick(100);
      expect(sut()).toBe(3);
    }));
  });

  describe('when created from a value', () => {
    runDebugNameOptionTest((debugName) => throttleSignal(1, 500, { debugName }));
    runInjectorOptionTest((injector) => throttleSignal(1, 500, { injector }));
    runTypeGuardTests(() => throttleSignal(1, 500));

    it('#set and #update change the source', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => throttleSignal(1, 500));
      sut.set(2);
      TestBed.tick();
      expect(sut()).toBe(2);
      sut.update((value) => value + 1);
      TestBed.tick();
      tick(500);
      expect(sut()).toBe(3);
    }));

    it('should adjust throttle time when time from a signal changes', fakeAsync(() => {
      const throttleTime = signal(500);
      const sut = TestBed.runInInjectionContext(() => throttleSignal(1, throttleTime));
      sut.set(2);
      TestBed.tick();
      sut.set(3);
      TestBed.tick();
      tick(100);
      throttleTime.set(200);
      TestBed.tick();
      tick(100);
      expect(sut()).toBe(3);
    }));

    it('respects the equal option', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => throttleSignal(2, 500, { equal: (a, b) => a % 2 === b % 2 }));
      sut.set(4);
      TestBed.tick();
      expect(sut()).toBe(2);
    }));

    it('#asReadonly reflects the throttled value', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => throttleSignal(1, 500));
      const readonly = sut.asReadonly();
      sut.set(2);
      TestBed.tick();
      expect(readonly()).toBe(2);
    }));
  });

  it('rejects disabling both leading and trailing emissions', () => {
    expect(() => TestBed.runInInjectionContext(() => throttleSignal(1, 500, { leading: false, trailing: false }))).toThrowError();
  });
});
