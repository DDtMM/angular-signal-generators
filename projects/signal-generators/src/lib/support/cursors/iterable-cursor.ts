import { Cursor, CursorResult } from './cursor';

export const ERR_BACKWARD_MOVE = 'Backwards movement is not supported.';
export const ERR_UNABLE_TO_RESET = 'The underlying iterable cannot be reset.  This could be because the iterable is a generator.';

export class IterableCursor<T> implements Cursor<T> {
  private currentItem: CursorResult<T> = { hasValue: false };
  private iterator: Iterator<T>;

  /**
   * 
   * @param source The iterable to iterate.
   * @param autoReset If true, when the iterator is a the end, the cursor will create a new iterator and start from the beginning.
   * @param maxSearchSize The maximum number of iterations to search before giving up.
   */
  constructor(private source: Iterable<T>, private readonly autoReset: boolean, private maxSearchSize = 65536) { 
    this.iterator = source[Symbol.iterator]();
  }

  moveTo(value: T): CursorResult<T> {
    // search from position first, returning the result if it is found or autoReset is off.
    this.searchFromCurrentPosition(value);
    if (this.currentItem.hasValue || !this.autoReset) {
      return this.currentItem;
    }
    this.reset();
    this.searchFromCurrentPosition(value);
    return this.currentItem;
  }

  next(relativeChange = 1): CursorResult<T> {
    if (relativeChange < 0) {
      throw new Error(ERR_BACKWARD_MOVE);
    }
    if (relativeChange === 0) {
      if (!this.currentItem.hasValue) {
        // try to see if a next value can be retrieved.
        const res = this.iterator.next();
        if (!res.done) {
          this.currentItem = { hasValue: true, value: res.value };
        }
      }
    }
    else {
      for (let i = 0; i < relativeChange; i++) {
        let res = this.iterator.next();
        if (!res.done) {
          this.currentItem = { hasValue: true, value: res.value };
        }
        else if (this.autoReset) {
          this.reset();
          res = this.iterator.next();
          if (res.done) {
            this.currentItem = { hasValue: false };
            break;
          }
          this.currentItem = { hasValue: true, value: res.value };
        }
        else {
          this.currentItem = { hasValue: false };
          break;
        }
      }
    }
    return { ...this.currentItem };
  }

  reset(): void {
    const nextCursor = this.source[Symbol.iterator]();
    if (nextCursor === this.iterator) {
      throw new Error(ERR_UNABLE_TO_RESET);
    }
    this.iterator = nextCursor;
    this.currentItem = { hasValue: false };
  }

  /** Used in {@link moveTo} to search from the current position. */
  private searchFromCurrentPosition(value: T): void {
    let elementsSearched = 0;
    let result = this.iterator.next();
    
    while (!result.done) {
      if (result.value === value) {
        this.currentItem = { hasValue: true, value };
        return;
      }
      if (++elementsSearched >= this.maxSearchSize) {
        break;
      }
      result = this.iterator.next();
    }
    this.currentItem = { hasValue: false };
  }
}