import { CreateSignalOptions, WritableSignal } from '@angular/core';
import { SIGNAL, SignalGetter, createSignal } from '@angular/core/primitives/signals';
import { MapBasedStorage } from '../internal/map-based-storage';
import { setDebugNameOnNode } from '../internal/utilities';
import { WebObjectStore } from '../internal/web-object-store';

/** A simple provider of persistent storage for {@link storageSignal}. */
export interface StorageSignalStore<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

/**
 * Creates a signal that will sync changes to some sort of storage.
 * The next time a signal with the same key is read, an alternative value to the initial value will be used.
 * It's probably better to use {@link sessionStorageSignal} or {@link localStorageSignal} instead of this.
 * @param initialValue The initialValue for the signal if it isn't in storage.
 * @param key The key to use for storage.  This should be unique to avoid conflicts when deserializing values.
 * @param storageProvider The provider of storage.
 * @param options Standard create signal options.
 * @typeParam T The type of the value that should be stored and deserialized.
 * @returns A writable signal
 * @example
 * ```ts
 * const storageProvider = Map<string, number>();
 * const signal1 = storageSignal(1, 'someKey', storageProvider);
 * signal1.set(100);
 * const signal2 = storageSignal(1, 'someKey', storageProvider);
 * console.log(signal1(), signal2()); // [LOG]: 100, 100
 * ```
 */
export function storageSignal<T>(initialValue: T, key: string, storageProvider: StorageSignalStore<T>, options: CreateSignalOptions<T> = {}): WritableSignal<T> {
  const storageValue = storageProvider.get(key);
  const [get, set] = createSignal(storageValue === undefined ? initialValue : storageValue);
  const $output = get as SignalGetter<T> & WritableSignal<T>;
  const outputNode = $output[SIGNAL];
  // The equal function needs to be checked BEFORE setting storage or the value will be inconsistent.
  const equalFn = options.equal ?? outputNode.equal;
  setDebugNameOnNode(outputNode, options.debugName);
  $output.asReadonly = () => $output;
  $output.set = (value: T) => {
    if (!equalFn(value, outputNode.value)) {
      storageProvider.set(key, value);
      set(value);
    }
  };
  $output.update =(updateFn: (value: T) => T) => {
    const next = updateFn(outputNode.value);
    if (!equalFn(next, outputNode.value)) {
      storageProvider.set(key, next);
      set(next);
    }
  };
  return $output;
}

/**
 * Options for {@link localStorageSignal} and {@link sessionStorageSignal}.
 * @typeParam T The type of the value that should be stored and deserialized.
 */
export interface WebStorageOptions<T> extends CreateSignalOptions<T> {
  /** An optional function to use when serializing a value with JSON.parse. */
  replacer?: (key: string, value: unknown) => unknown;
  /** An optional function to use when deserializing a value with JSON.parse. */
  reviver?: (key: string, value: unknown) => unknown;
}

/** Fallback storage provider for localStorageSignal.  Not assigned until needed. */
let LOCAL_STORAGE_FALLBACK: Storage;
/** Fallback storage provider for sessionStorageSignal.  Not assigned until needed. */
let SESSION_STORAGE_FALLBACK: Storage;

/**
 * Generates a signal using localStorage as the store.  A shared Map is used if session storage is not supported.
 *
 * @param initialValue the initial value for the signal
 * @param key the key to use in localStorage
 * @param options optional options to configure the signal and underlying storage.
 * @typeParam T The type of the value that should be stored and deserialized.
 * @returns the writable signal generated from storageSignal.
 * @example
 * ```ts
 * const signal1 = localStorageSignal(1, 'someKey');
 * console.log(signal1()); // This MIGHT not be 1 depending on what was stored in localStorage for "someKey".
 * signal1.set(100);
 * console.log(signal1()); // 100 ("someKey" is now 100 in localStorage)
 * ```
 * @see {@link storageSignal}
 */
export function localStorageSignal<T>(initialValue: T, key: string, options: WebStorageOptions<T> = {}): WritableSignal<T> {
  const storage = globalThis.localStorage ?? (LOCAL_STORAGE_FALLBACK ??= new MapBasedStorage());
  const store = new WebObjectStore<T>(storage, options.replacer, options.reviver);
  return storageSignal<T>(initialValue, key, store, options);
}

/**
 * Generates a signal using sessionStorage as the store.  A shared Map is used if session storage is not supported.
 *
 * @param initialValue the initial value for the signal
 * @param key the key to use in sessionStorage
 * @param options optional options to configure the signal and underlying storage.
 * @typeParam T The type of the value that should be stored and deserialized.
 * @returns the writable signal generated from storageSignal.
 * @example
 * ```ts
 * const signal1 = sessionStorageSignal(1, 'someKey');
 * console.log(signal1()); // This MIGHT not be 1 depending on what was stored in sessionStorage for "someKey".
 * signal1.set(100);
 * console.log(signal1()); // 100 ("someKey" is now 100 in sessionStorage)
 * ```
 * @see {@link storageSignal}
 */
export function sessionStorageSignal<T>(initialValue: T, key: string, options: WebStorageOptions<T> = {}): WritableSignal<T> {
  const storage = globalThis.sessionStorage ?? (SESSION_STORAGE_FALLBACK ??= new MapBasedStorage());
  const store = new WebObjectStore<T>(storage, options.replacer, options.reviver);
  return storageSignal<T>(initialValue, key, store, options);
}
