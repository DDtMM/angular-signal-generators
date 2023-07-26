import { Injector, WritableSignal, signal } from '@angular/core';
import { ValueSource, createGetValueFn, watchValueSourceFn } from '../value-source';

const NO_ELEMENTS = 'Sequence contains no elements.';

interface Cursor<T> {
  next(relativeChange?: number): T;
  reset(): void;
}

class ArrayCursor<T> implements Cursor<T> {
  private index = -1;

  constructor(private data: T[], private autoReset: boolean = false) {}
  next(relativeChange = 1): T {
    this.assertIsNonEmpty();
    if (relativeChange === 0 && this.index === -1) {
      // auto move forward if relativeChange is 0, and we haven't moved forward yet.
      return this.data[this.index = 0];
    }
    this.index = this.autoReset
      ? (this.index + relativeChange) % this.data.length
      : Math.max(0, Math.min(this.index + relativeChange, this.data.length - 1));

    return this.data[this.index];
  }
  reset(): void {
    this.index = -1;
  }
  private assertIsNonEmpty(): boolean {
    if (this.data.length === 0) {
      throw new Error(NO_ELEMENTS);
    }
    return true;
  }
}

class IterableCursor<T> implements Cursor<T> {
  private current?: IteratorResult<T> | undefined;
  private iterator: Iterator<T>;

  constructor(private iterable: Iterable<T>, private autoResult = false) {
    this.iterator = iterable[Symbol.iterator]()
  }
  next(relativeChange = 1): T {
    if (relativeChange < 0) {
      throw new Error('IterableCursor can only read forward.')
    }
    let res: IteratorResult<T>;
    for (let i = 0; i < relativeChange; i++) {
      res = this.iterator.next();
      if (res.done) {
        if (!this.autoResult) {
          return this.getCurrentResult().value; // return last value
        }
        this.reset();
        res = this.getCurrentResult();
      }
      this.current = res;
    }
    return this.getCurrentResult().value;
  }
  reset(): void {
    this.iterator = this.iterable[Symbol.iterator]();
    this.current = undefined;
  }
  /** Gets the current result safely, advancing if one isn't set. */
  private getCurrentResult(): IteratorResult<T> {
    if (this.current === undefined) {
      this.current = this.iterator.next();
      if (this.current.done) {
        throw new Error(NO_ELEMENTS);
      }
    }
    return this.current;
  }
}

export interface SequenceSignalOptions {
  /** If true, then the sequence will not loop and restart needs to be called. */
  disableAutoReset?: boolean;
  /** injector should only be necessary if outside injector context and sequence is SignalLike. */
  injector?: Injector;
}

export interface SequenceSignal<T> extends WritableSignal<T> {
  /** Updates the signal to the next item in sequence.  If at end and autoRestart is not disabled, then it will return to start. */
  next: (relativeChange?: number) => void;
  /** Updates the signal to the first item in sequence. */
  reset: () => void;
}

export function sequenceSignal<T>(sequence: ValueSource<T[] | Iterable<T>>, options: SequenceSignalOptions = {}): SequenceSignal<T> {
  const sequenceItemsInternalFn = createGetValueFn(sequence, options.injector);
  let cursor = getCursor(sequenceItemsInternalFn());
  const output = signal(cursor.next());

  function getCursor(data: Iterable<T>): Cursor<T> {
    return Array.isArray(data) ? new ArrayCursor(data, !options.disableAutoReset) : new IterableCursor(data, !options.disableAutoReset);
  }

  watchValueSourceFn(sequenceItemsInternalFn, x => cursor = getCursor(x), options.injector);

  return Object.assign(output, {
    next: (relativeChange = 1) => {
      output.set(cursor.next(relativeChange));
    },
    reset: () => {
      cursor.reset();
      output.set(cursor.next());
    }
  });
}
