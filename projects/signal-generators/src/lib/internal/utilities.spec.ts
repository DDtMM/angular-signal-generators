import { Injectable, Injector, signal } from '@angular/core';
import { createSignal, SIGNAL } from '@angular/core/primitives/signals';
import { TestBed } from '@angular/core/testing';
import { runTypeGuardTests } from '../../testing/common-signal-tests';
import { setProdMode } from '../../testing/dev-mode-utilities';
import { asReadonlyFnFactory, getDestroyRef, getInjector, hasKey, isMethodKey, setDebugNameOnNode, setEqualOnNode } from './utilities';

describe('asReadonlyFnFactory', () => {
  runTypeGuardTests(() => asReadonlyFnFactory(signal(1))());
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
    const injector = TestBed.inject(Injector);
    const destroyRef = getDestroyRef(() => 1, injector);
    expect(destroyRef).toBeDefined();
  });
  it('returns destroyRef when no injector is passed but inside injector context', () => {
    const destroyRef = TestBed.runInInjectionContext(() => getDestroyRef(() => 1));
    expect(destroyRef).toBeDefined();
  });
});

describe('getInjector', () => {
  it('throws when no injector is passed and not in injector context', () => {
    expect(() => getInjector(() => 1)).toThrowError();
  });
  describe('when in injector context', () => {
    class TestHarness {
      injectorRef = getInjector(() => 1);
    }
    it('returns injector', () => {
      expect(TestBed.configureTestingModule({ providers: [TestHarness] }).inject(TestHarness).injectorRef).toBeDefined();
    });
  });
});

describe('hasKey', () => {
  interface Something { keyX?: number; }
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

describe('setDebugNameOnNode', () => {
  it('sets debugName if is defined and in devMode', () => {
    const [target] = createSignal(1);
    const debugName = `debugName_${Math.random() * Number.MAX_SAFE_INTEGER}`;
    setDebugNameOnNode(target[SIGNAL], debugName);
    expect(target[SIGNAL].debugName).toBe(debugName);
  });
  it('does not set debugName is defined but NOT in devMode', () => {
    setProdMode(true);
    const [target]  = createSignal(1);
    target[SIGNAL].debugName = 'UNCHANGED';
    const debugName = `debugName_${Math.random() * Number.MAX_SAFE_INTEGER}`;
    setDebugNameOnNode(target[SIGNAL], debugName);
    expect(target[SIGNAL].debugName).toBe('UNCHANGED');
    setProdMode(false);
  });
  it('does not set debugName if it is undefined', () => {
    const [target]  = createSignal(1);
    target[SIGNAL].debugName = 'UNCHANGED';
    setEqualOnNode(target[SIGNAL], undefined);
    expect(target[SIGNAL].debugName).toBe('UNCHANGED');
  });
});
describe('setEqualOnNode', () => {
  it('sets equal from options if options.equal is defined', () => {
    const [target]  = createSignal(1);
    const equalFn = (x: number, y: number) => x === y;
    setEqualOnNode(target[SIGNAL], equalFn);
    expect(target[SIGNAL].equal).toBe(equalFn);
  });
  it('does not set equal on a node if equalFn is undefined', () => {
    const [target]  = createSignal(1);
    const expectedEqual = target[SIGNAL].equal;
    setEqualOnNode(target[SIGNAL], undefined);
    expect(target[SIGNAL].equal).toBe(expectedEqual);
  });
})
