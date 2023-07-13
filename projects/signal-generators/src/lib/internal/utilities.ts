/** A type safeway for determining a key is in an object. */
export function hasKey<T extends object>(obj: T, key: keyof T): obj is T & { [K in typeof key]-?: T[K] } {
  return (key in obj);
}
