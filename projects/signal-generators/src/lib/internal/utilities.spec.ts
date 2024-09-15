import { Injectable, signal } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';
import { setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { asReadonlyFnFactory, getDestroyRef, getInjector, hasKey, isMethodKey } from './utilities';

describe('asReadonlyFnFactory', () => {
  setupTypeGuardTests(() => asReadonlyFnFactory(signal(1))());
  it('returns as signal without other methods', () => {
    const $result = asReadonlyFnFactory(signal(1))();
    expect(Object.keys($result)).toEqual([]);
  });
  it('resulting signal reflects source signals value', () => {
    const $src = signal(1);
    const $result = asReadonlyFnFactory($src)();
    expect($result()).toBe(1);
    $src.set(25);
    expect($result()).toBe(25);
  });
});

describe('getDestroyRef', () => {
  it('throws when no injector is passed and not in injector context', () => {
    expect(() => getDestroyRef(() => 1)).toThrowError();
  });
  it('returns destroyed ref from passed injector', () => {
    const injector = MockRender().componentRef.injector;
    const destroyRef = getDestroyRef(() => 1, injector);
    expect(destroyRef).toEqual(destroyRef);
  });
  describe('when in injector context', () => {
    @Injectable()
    class TestHarness {
      destroyRef = getDestroyRef(() => 1);
    }
    beforeEach(() => MockBuilder(TestHarness));
    it('returns injector when no injector is passed', () => {
      expect(MockRender(TestHarness).point.componentInstance.destroyRef).toBeDefined();
    });
  });
});

describe('getInjector', () => {
  it('throws when no injector is passed and not in injector context', () => {
    expect(() => getInjector(() => 1)).toThrowError();
  });
  describe('when in injector context', () => {
    @Injectable()
    class TestHarness {
      injectorRef = getInjector(() => 1);
    }
    beforeEach(() => MockBuilder(TestHarness));
    it('returns injector', () => {
      expect(MockRender(TestHarness).point.componentInstance.injectorRef).toBeDefined();
    });
  });
});

describe('hasKey', () => {
  type Something = { keyX?: number };
  it('returns true if key is in object', () => expect(hasKey({ keyX: 1 }, 'keyX')).toBeTrue());
  it('returns false if key is not in object', () => expect(hasKey<Something>({}, 'keyX')).toBeFalse());
  it('returns false if object is nullish', () => expect(hasKey<Something>(undefined, 'keyX')).toBeFalse());
});

describe('isMethodKey', () => {
  const srcObj = { method: () => 1, notMethod: 1 };
  it('returns true if key is key of a method', () => expect(isMethodKey(srcObj, 'method')).toBeTrue());
  it('returns false if key is not a key of a method', () => expect(isMethodKey(srcObj, 'notMethod')).toBeFalse());
  it('returns false if object is nullish', () => expect(isMethodKey(undefined, 'notMethod')).toBeFalse());
});
