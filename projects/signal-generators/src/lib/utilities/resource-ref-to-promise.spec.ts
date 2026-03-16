import { Injector, ResourceRef, signal, WritableSignal } from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { runInjectorOptionTest } from '../../testing/common-signal-tests';
import { resourceRefToPromise } from './resource-ref-to-promise';

describe('resourceRefToPromise', () => {
  runInjectorOptionTest((injector) => {
    const resourceRef = createFakeResource<number>({ isLoading: true, value: undefined });
    return () => {
      const promise = resourceRefToPromise(resourceRef as unknown as ResourceRef<number | undefined>, injector);
      resourceRef.isLoading.set(false);
      resourceRef.value.set(4);
      return promise;
    };
  });

  it('resolves immediately when resource is already loaded', fakeAsync(() => {
    const injector = TestBed.inject(Injector);
    const resourceRef = createFakeResource<number>({ isLoading: false, value: 123 });
    let result: number | undefined;

    resourceRefToPromise(resourceRef as unknown as ResourceRef<number | undefined>, injector).then((value) => (result = value));
    flushMicrotasks();

    expect(result).toBe(123);
  }));

  it('rejects immediately when resource already has an error', fakeAsync(() => {
    const injector = TestBed.inject(Injector);
    const resourceRef = createFakeResource<number>({ isLoading: true, error: new Error('initial failure') });
    let rejection: unknown;

    resourceRefToPromise(resourceRef as unknown as ResourceRef<number | undefined>, injector).catch((error) => (rejection = error));
    flushMicrotasks();

    expect(rejection).toEqual(jasmine.any(Error));
    expect((rejection as Error).message).toBe('initial failure');
  }));

  it('resolves when loading transitions to false', fakeAsync(() => {
    const injector = TestBed.inject(Injector);
    const resourceRef = createFakeResource<number>({ isLoading: true, value: undefined });
    let result: number | undefined;

    resourceRefToPromise(resourceRef as unknown as ResourceRef<number | undefined>, injector).then((value) => (result = value));
    TestBed.tick();

    expect(result).toBeUndefined();

    resourceRef.value.set(42);
    resourceRef.isLoading.set(false);
    TestBed.tick();
    flushMicrotasks();

    expect(result).toBe(42);
  }));

  it('rejects when an error appears while loading', fakeAsync(() => {
    const injector = TestBed.inject(Injector);
    const resourceRef = createFakeResource<number>({ isLoading: true, value: undefined });
    let rejection: unknown;

    resourceRefToPromise(resourceRef as unknown as ResourceRef<number | undefined>, injector).catch((error) => (rejection = error));
    TestBed.tick();

    const err = new Error('request failed');
    resourceRef.error.set(err);
    TestBed.tick();
    flushMicrotasks();

    expect(rejection).toBe(err);
  }));
});

interface FakeResourceRef<TValue> {
  readonly error: (() => Error | undefined) & WritableSignal<Error | undefined>;
  readonly isLoading: (() => boolean) & WritableSignal<boolean>;
  readonly value: (() => TValue | undefined) & WritableSignal<TValue | undefined>;
}

function createFakeResource<TValue>(state: {
  isLoading: boolean;
  value?: TValue | undefined;
  error?: Error | undefined;
}): FakeResourceRef<TValue> {
  return {
    error: signal(state.error),
    isLoading: signal(state.isLoading),
    value: signal(state.value)
  };
}
