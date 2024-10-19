import { Injector, untracked, WritableSignal } from '@angular/core';
import { createSignal, SIGNAL, SignalGetter, signalSetFn } from '@angular/core/primitives/signals';
import { coerceSignal } from '../internal/signal-coercion';
import { isReactive } from '../internal/reactive-source-utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource } from '../value-source';

const NO_ELEMENTS = 'Sequence contains no elements.';

export type CursorResult<T> = {
  /** If false there was no value, possibly because it went past a boundary or has no elements. */
  hasValue: false;
} | {
  /** If true, then the value property should be set. */
  hasValue: true;
  /** The current value after last move. */
  value: T;
};

/**
 * Iterators can't be reset, so here's a cursor.
 */
export interface Cursor<T> {
  /**
   * Should move to the next element if relativeChange isn't passed,
   * otherwise it should move the amount of relativeChange.
   * If not at edge and moving past edge, it should return the edge value.
   */
  next(relativeChange?: number): CursorResult<T>;
  /**
   * Should set it to as though it hasn't reached the first element.
   */
  reset(): void;
}

/** distinguishes between arrayLike and cursor */
function isCursor<T>(obj: Cursor<T> | ArrayLike<T>): obj is Cursor<T> {
  return 'next' in obj;
}

class ArrayCursor<T> implements Cursor<T> {
  private index = -1;

  constructor(private data: ArrayLike<T>, private autoReset: boolean) {}
  next(relativeChange = 1): CursorResult<T> {

    if (this.data.length === 0) {
      return { hasValue: false };
    }
    if (relativeChange === 0 && this.index === -1) {
      // auto move forward if relativeChange is 0, and we haven't moved forward yet.
      return { hasValue: true, value: this.data[this.index = 0] };
    }

    if (this.autoReset) {
      this.index = (this.index + relativeChange) % this.data.length;
    }
    else if (this.index <= 0 && relativeChange < 0) { // if at start, put in reset position
      this.index = -1;
    }
    else if (this.index >= this.data.length - 1 && relativeChange > 0) { // if at end, put at complete position.
      this.index = this.data.length;
    }
    else {
      this.index = Math.max(0, Math.min(this.index + relativeChange, this.data.length - 1)); // stay constrained
    }

    return { hasValue: this.index > -1 && this.index < this.data.length, value: this.data[this.index] };
  }
  reset(): void {
    this.index = -1;
  }
}

export interface SequenceSignalOptions {
  /** If true, then the sequence will not loop and restart needs to be called. */
  disableAutoReset?: boolean;
  /** injector should only be necessary if passing in an observable outside injector context. */
  injector?: Injector;
}

export interface SequenceSignal<T> extends WritableSignal<T> {
  /** Updates the signal to the next item in sequence.  If at end and autoRestart is not disabled, then it will return to start. */
  next: (relativeChange?: number) => void;
  /** Updates the signal to the first item in sequence. */
  reset: () => void;
}

/**
 * This creates a signal that will cycle through a source of values, returning the the start after each call of next.
 * @param sequence The source of sequence values.
 * Could be an ArrayLike object or a "Cursor" which is like an iterator, but with a reset method.
 * @param options Options for creating the sequence signal.
 * @returns The sequence signal.
 * @example
 * ```ts
 * const boolSeq = sequenceSignal([true, false]);
 * console.log(boolSeq()) // true
 * boolSeq.next();
 * console.log(boolSeq()) // false
 * boolSeq.next();
 * console.log(boolSeq()) // true
 *
 * const lettersSeq = sequenceSignal('ABCDEFG');
 * console.log(letterSeq()) // A;
 * boolSeq.next(2);
 * console.log(letterSeq()) // C;
 *
 * // pass a "Cursor" to generate a sequence.
 * sequenceSignal((() => {
 *   let values = [1, 2];
 *   return {
 *     next: (relativeChange: number) => {
 *       for (let i = 0; i < relativeChange; i++) {
 *         values = [values[1], values[0] + values[1]];
 *       }
 *       for (let i = relativeChange; i < 0; i++) {
 *         values = [Math.max(1, values[1] - values[0]), Math.max(values[0], 2)];
 *       }
 *       return { hasValue: true, value: values[0] };
 *     },
 *     reset: () => values = [1, 2]
 *   };
 * })());
 * console.log(fibSeq()); // 1;
 * fibSeq.next();
 * console.log(fibSeq()); // 2;
 * ```
 */
export function sequenceSignal<T>(sequence: ValueSource<ArrayLike<T> | Cursor<T>>, options: SequenceSignalOptions = {}): SequenceSignal<T> {
  const sequenceCursorGetter = isReactive(sequence)
    ? createCursorGetterFromReactiveSource(sequence)
    : createCursorGetterFromValue(sequence)

  const $output = createSignal(getFirstValue(sequenceCursorGetter())) as SignalGetter<T> & SequenceSignal<T>;
  const outputNode = $output[SIGNAL];
  $output.next = (relativeChange = 1) => {
    const res = sequenceCursorGetter().next(relativeChange);
    if (res.hasValue) {
      signalSetFn(outputNode, res.value);
    }
  };
  $output.reset = () => {
    sequenceCursorGetter().reset();
    $output.next();
  }
  return $output;

  /**
   * Creates function that gets the current cursor from a {@link ReactiveSource}.
   * This is done in lieu of using an effect.
   */
  function createCursorGetterFromReactiveSource(inputSource: ReactiveSource<ArrayLike<T> | Cursor<T>>): () => Cursor<T> {
    const $input = coerceSignal(inputSource, options);
    let lastSequence = untracked($input);
    let cachedCursor = getCursor(lastSequence);
    return () => {
      const currentSequence = untracked($input);
      if (currentSequence !== lastSequence) {
        lastSequence = currentSequence;
        cachedCursor = getCursor(lastSequence);
      }
      return cachedCursor;
    };
  }
  /** Creates function that gets a cached cursor from a value.  */
  function createCursorGetterFromValue(value: ArrayLike<T> | Cursor<T>): () => Cursor<T> {
    const cursor = getCursor(value);
    return () => cursor;
  }
  /** This used to do more. */
  function getCursor(data: ArrayLike<T> | Cursor<T>): Cursor<T> {
    return isCursor(data) ? data : new ArrayCursor(data, !options.disableAutoReset);
  }

  /** Ensure that there's a first value. */
  function getFirstValue(cursor: Cursor<T>): T {
    const res = cursor.next();
    if (!res.hasValue) {
      throw new Error(NO_ELEMENTS);
    }
    return res.value;
  }
}
