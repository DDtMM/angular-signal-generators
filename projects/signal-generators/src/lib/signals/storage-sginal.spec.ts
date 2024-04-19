import { setupComputedAndEffectTests, setupDoesNotCauseReevaluationsSimplyWhenNested, setupTypeGuardTests } from '../../testing/common-signal-tests.spec';
import { WebObjectStore } from '../internal/web-object-store';
import { MapBasedStorage } from '../internal/map-based-storage';
import { localStorageSignal, sessionStorageSignal, storageSignal } from './storage-signal';


describe('storageSignal', () => {
  setupTypeGuardTests(() => storageSignal(1, 'test', createStorage()));
  setupComputedAndEffectTests(() => {
    const sut = storageSignal(1, 'test', createStorage());
    return [sut, () => { sut.set(2) }];
  });
  setupDoesNotCauseReevaluationsSimplyWhenNested(
    () => storageSignal(1, 'test', createStorage()),
    (sut) => sut.set(2)
  );
  it('initially returns initialValue', () => {
    const sut = storageSignal(1, 'test', createStorage());
    expect(sut()).toBe(1);
  });
  it('should be able to store and retrieve objects', () => {
    const storage = createStorage();
    const sut = storageSignal<unknown>({ r: 2, d: '2' }, 'test', storage);
    sut.set({ c: 3, p: '0' });
    expect(sut()).toEqual({ c: 3, p: '0' });
    expect(storage.get('test')).toEqual({ c: 3, p: '0' });
  });
  it('uses the initial value from storage if it exists', () => {
    const storage = createStorage();
    storage.set('test', 45);
    const sut = storageSignal(1, 'test', storage);
    expect(sut()).toBe(45);
  });
  it('sets a value in storage when set is called', () => {
    const storage = createStorage();
    const sut = storageSignal(1, 'test', storage);
    sut.set(21)
    expect(sut()).toBe(21);
    expect(storage.get('test')).toBe(21);
  });
  it('sets a value in storage when updated is called', () => {
    const storage = createStorage<number>();
    const sut = storageSignal(3, 'test', storage);
    sut.update(x => x * 5);
    expect(sut()).toBe(15);
    expect(storage.get('test')).toBe(15);
  });

  function createStorage<T>() {
    return new WebObjectStore<T>(new MapBasedStorage());
  }
});

describe('localStorageSignal', () => {
  it('uses localStorage when it exists on globalThis', () => {
    Object.defineProperty(globalThis, 'localStorage', { value: new MapBasedStorage() });
    const sut = localStorageSignal(15, 'test');
    sut.set(83);
    expect(sut()).toBe(83);
    const sut2 = localStorageSignal(24, 'test');
    expect(sut2()).toBe(83);
    expect(globalThis.localStorage.getItem('test')).toBe('83');
  });
  it('uses alternative storage when localStorage is not on globalThis', () => {
    Object.defineProperty(globalThis, 'localStorage', { value: undefined });
    const sut = localStorageSignal(15, 'test');
    sut.set(88);
    expect(sut()).toBe(88);
    const sut2 = localStorageSignal(25, 'test');
    expect(sut2()).toBe(88);
    expect(globalThis.localStorage as unknown).toBe(undefined);
  });
});
describe('sessionStorageSignal', () => {
  it('uses sessionStorage when it exists on globalThis', () => {
    Object.defineProperty(globalThis, 'sessionStorage', { value: new MapBasedStorage() });
    const sut = sessionStorageSignal(15, 'test');
    sut.set(41);
    expect(sut()).toBe(41);
    const sut2 = sessionStorageSignal(21, 'test');
    expect(sut2()).toBe(41);
    expect(globalThis.sessionStorage.getItem('test')).toBe('41');
  });
  it('uses alternative storage when sessionStorage is not on globalThis', () => {
    Object.defineProperty(globalThis, 'sessionStorage', { value: undefined });
    const sut = sessionStorageSignal(15, 'test');
    sut.set(105);
    expect(sut()).toBe(105);
    const sut2 = sessionStorageSignal(105, 'test');
    expect(sut2()).toBe(105);
    expect(globalThis.sessionStorage as unknown).toBe(undefined);
  });
});
