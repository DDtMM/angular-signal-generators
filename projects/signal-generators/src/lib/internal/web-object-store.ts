/** Combines web storage with JSON serialization in a signature compatible with Map. */
export class WebObjectStore<T> {
  /**
   * Initializes BrowserStorageStore.
   *
   * @param webStorage Provider of web storage.
   * @param replacer An optional replacer function when serializing JSON.
   * @param reviver An optional reviver function when deserializing JSON.
   */
  constructor(
    private webStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
    private replacer?: (key: string, value: unknown) => unknown,
    private reviver?: (key: string, value: unknown) => unknown) { }

  /** Gets an item or returns undefined if it does not exist. */
  get(key: string): T | undefined {
    const valueRaw = this.webStorage.getItem(key);
    return (valueRaw === null) ? undefined : JSON.parse(valueRaw, this.reviver) as T;
  }

  /**
   * Sets an item in storage with the given key.
   * If undefined is passed, then the item is removed since that is not valid json and cannot be serialized.
   */
  set(key: string, value: T): void {
    if (value === undefined) {
      this.webStorage.removeItem(key);
    }
    else {
      this.webStorage.setItem(key, JSON.stringify(value, this.replacer));
    }
  }
}

