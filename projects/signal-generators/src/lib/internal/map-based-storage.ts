/** A functioning implementation of browser Storage that can be used in tests and is backed by Map */
export class MapBasedStorage implements Storage {
  private readonly storageMap = new Map<string, string>();
  get length(): number { return this.storageMap.size; }

  clear(): void { return this.storageMap.clear(); }
  getItem(key: string): string | null { return this.storageMap.get(key) ?? null }
  key(index: number): string | null { return Array.from(this.storageMap.keys())[index] ?? null; }
  removeItem(key: string): void { this.storageMap.delete(key); }
  setItem(key: string, value: string): void { this.storageMap.set(key, value); }
}
