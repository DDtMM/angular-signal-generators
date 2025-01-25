import { signal, WritableSignal } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { gatedEffect } from './gated-effect';

describe('gatedEffect', () => {

  it('works like a normal effect if no conditions are provided', fakeAsync(() => {
    const $a = signal(1);
    const $b = signal(1);
    TestBed.runInInjectionContext(() => gatedEffect(() => $b.set($a() + 1)));
    TestBed.flushEffects();
    $a.set(3);
    TestBed.flushEffects();
    expect($b()).toBe(4);
  }));

  it('can be destroyed with returned effectRef.destroy()', fakeAsync(() => {
    const $a = signal(1);
    const $b = signal(1);
    const effectRef = TestBed.runInInjectionContext(() => gatedEffect(() => $b.set($a() + 1)));
    TestBed.flushEffects(); // This must be called so that the first, required effect run occurs.
    $a.set(3);
    effectRef.destroy();
    TestBed.flushEffects();
    expect($b()).toBe(2);
  }));

  it('will execute only when passed "filter" option returns true', fakeAsync(() => {
    const $a = signal(2);
    const $b = signal(1);
    TestBed.runInInjectionContext(() => gatedEffect(() => $b.set($a() + 1), { filter: () => $a() % 2 === 0 }));
    TestBed.flushEffects();
    expect($b()).toBe(3);
    $a.set(3);
    TestBed.flushEffects();
    expect($b()).toBe(3);
    $a.set(4);
    TestBed.flushEffects();
    expect($b()).toBe(5);
  }));

  it('will start executing once the "start" condition is met', fakeAsync(() => {
    const $a = signal(1);
    const $b = signal(1);
    TestBed.runInInjectionContext(() => gatedEffect(() => $b.set($a() + 1), { start: () => $a() > 3 }));
    TestBed.flushEffects();
    expect($b()).toBe(1);
    TestBed.flushEffects();
    $a.set(2);
    TestBed.flushEffects();
    expect($b()).toBe(1);
    $a.set(4);
    TestBed.flushEffects();
    expect($b()).toBe(5);
  }));

  it('will stop executing after a set number of times according to the "times" option', fakeAsync(() => {
    const $a = signal(1);
    const $b = signal(1);
    TestBed.runInInjectionContext(() => gatedEffect(() => $b.set($a() + 1), { times: 2 }));
    TestBed.flushEffects();
    expect($b()).toBe(2); // This counts as once.
    TestBed.flushEffects(); // nothing should run here.
    $a.set(3);
    TestBed.flushEffects();
    expect($b()).toBe(4); // last run
    $a.set(4);
    TestBed.flushEffects();
    expect($b()).toBe(4); // no change
  }));

  it('will stop executing once "until" condition is met', fakeAsync(() => {
    const $a = signal(1);
    const $b = signal(1);
    TestBed.runInInjectionContext(() => gatedEffect(() => $b.set($a() + 1), { until: () => $a() > 3 }));
    TestBed.flushEffects();
    expect($b()).toBe(2); 
    $a.set(3);
    TestBed.flushEffects();
    expect($b()).toBe(4); // last run
    $a.set(4);
    TestBed.flushEffects();
    expect($b()).toBe(4); // no change
  }));
});
