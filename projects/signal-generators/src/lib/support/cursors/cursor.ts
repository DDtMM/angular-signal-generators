/** A result from a {@link Cursor}. */
export type CursorResult<T> = {
  /** If false there was no value, possibly because it went past a boundary or has no elements. */
  hasValue: false;
  /** The value will be undefined if hasValue is false. */
  value?: unknown;
} | {
  /** If true, then the value property should be set. */
  hasValue: true;
  /** The current value after last move. */
  value: T;
};

/**
 * Like an iterator, but with a reset method.
 * @typeParam TVal The type of the value being iterated.
 */
export interface Cursor<TVal> {
  /** 
   * Performs a forward search from current position.
   * If nothing is found, and autoReset is true, then it will resume search from the beginning.
   * Will set position past end if nothing is found.
   * 
   * @param value The value to search for.
   * @returns The current cursor result after search is conducted.
   */
  moveTo(value: TVal): CursorResult<TVal>;
  /**
   * Should move to the next element if relativeChange isn't passed,
   * otherwise it should move the amount of relativeChange.
   * 
   * @param relativeChange The amount to move.  If no value is passed then it will move forward 1.
   * @returns The current cursor state after movement.
   */
  next(relativeChange?: number): CursorResult<TVal>;
  /** Should reset to right before the beginning. */
  reset(): void;
}
