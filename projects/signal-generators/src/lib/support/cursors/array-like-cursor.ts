import { Cursor, CursorResult } from './cursor';

/** A cursor for ArrayLike objects. */
export class ArrayLikeCursor<T> implements Cursor<T> {
  protected index = -1;

  constructor(protected readonly source: ArrayLike<T>, protected readonly autoReset: boolean) {}

  /** 
   * Performs a forward search from current position.
   * Search entire collection if autoReset is true.
   * Will set position past end if nothing is found.
   * 
   * @returns The current cursor result.
   */
  moveTo(value: T): CursorResult<T> {
    // search from position first.
    for (let i = this.index + 1; i < this.source.length; i++) {
      if (this.source[i] === value) {
        this.index = i;
        return { hasValue: true, value }; 
      }
    }
    // if not found search from start.
    if (this.autoReset) {
      for (let i = 0; i <= this.index; i++) {
        if (this.source[i] === value) {
          this.index = i;
          return { hasValue: true, value }; 
        }
      }
    }
    this.index = this.source.length; // set to end to indicate search was unsuccessful.
    return { hasValue: false };
  }

  next(relativeChange = 1): CursorResult<T> {

    if (this.source.length === 0) {
      return { hasValue: false };
    }
    if (relativeChange === 0 && this.index === -1) {
      // auto move forward if relativeChange is 0, and we haven't moved forward yet.
      return { hasValue: true, value: this.source[this.index = 0] };
    }

    if (this.autoReset) {
      if (this.index === -1 && relativeChange < 0) {
        this.index = 0; // it doesn't make much sense to go backwards from -1 so assume it was at the start element.
      }
      this.index = ((this.index + relativeChange) % this.source.length + this.source.length) % this.source.length;
    }
    else {
      // stay constrained to within the array bounds + 1.
      this.index = Math.max(-1, Math.min(this.index + relativeChange, this.source.length)) 
    }
    return { 
      hasValue: this.index > -1 && this.index < this.source.length, 
      value: this.source[this.index] 
    };
  }
  reset(): void {
    this.index = -1;
  }

}
