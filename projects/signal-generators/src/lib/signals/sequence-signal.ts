import { CreateSignalOptions, Injector, Signal, untracked } from '@angular/core';
import { createSignal, SIGNAL, SignalGetter, signalSetFn } from '@angular/core/primitives/signals';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { setDebugNameOnNode } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ArrayLikeCursor } from '../support/cursors/array-like-cursor';
import { Cursor } from '../support/cursors/cursor';
import { IterableCursor } from '../support/cursors/iterable-cursor';
import { ValueSource } from '../value-source';

export const ERR_BOUNDS_EXCEEDED = 'Sequence cursor has exceeded bounds.';
export const ERR_ELEMENT_NOT_PRESENT = 'Element was not present in sequence.';
export const ERR_NO_ELEMENTS = 'Sequence contains no elements.';
export const ERR_INVALID_SOURCE = 'Invalid source type passed to sequence signal.';

/** Types that can be used in conjunction with {@link sequenceSignal}. */
export type SequenceSource<T> = ArrayLike<T> | Cursor<T> | Iterable<T>;

export interface SequenceSignalOptions extends Pick<CreateSignalOptions<unknown>, 'debugName'> {
  /** 
   * If true, then the sequence will not loop and restart needs to be called. 
   * This is used when creating a cursor internally.  If a cursor is provided as a source, then this will be ignored.
   */
  disableAutoReset?: boolean;
  /** injector should only be necessary if passing in an observable outside injector context. */
  injector?: Injector;
}

export interface SequenceSignal<T> extends Signal<T> {
  /** 
   * Updates the signal to the next item in sequence.  
   * If at end and the option {@link SequenceSignalOptions.disableAutoReset} was passed as true, then it will move to the start. 
   */
  next(relativeChange?: number): void;
  /** Updates the signal to the first item in sequence. */
  reset(): void;
  /** Moves the sequence to the next element that matches the passed value, ignoring the current element.  Will throw if not found. */
  set(value: T): void;
  /** Moves the sequence to the next element that matches the passed value, ignoring the current element.  Will throw if not found. */
  update(updateFn: (value: T) => T): void;
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
export function sequenceSignal<T>(
  sequence: ValueSource<SequenceSource<T>>,
  options: SequenceSignalOptions = {}
): SequenceSignal<T> {
  const sequenceCursorGetter = isReactive(sequence)
    ? createCursorGetterFromReactiveSource(sequence)
    : createCursorGetterFromValue(sequence);

  const $output = createSignal(getFirstValue(sequenceCursorGetter())) as SignalGetter<T> & SequenceSignal<T>;
  const outputNode = $output[SIGNAL];
  setDebugNameOnNode(outputNode, options.debugName);
  $output.next = (relativeChange = 1) => {
    const res = sequenceCursorGetter().next(relativeChange);
    if (!res.hasValue) {
      throw new Error(ERR_BOUNDS_EXCEEDED);
    }
    signalSetFn(outputNode, res.value);
  };
  $output.reset = () => {
    sequenceCursorGetter().reset();
    $output.next();
  };
  $output.set = (value: T) => {
    const res = sequenceCursorGetter().moveTo(value);
    if (!res.hasValue) {
      throw new Error(ERR_ELEMENT_NOT_PRESENT);
    }
    signalSetFn(outputNode, value);
  };
  $output.update = (updateFn: (value: T) => T) => {
    const nextValue = updateFn(outputNode.value);
    $output.set(nextValue);
  };
  return $output;

  /**
   * Creates function that gets the current cursor from a {@link ReactiveSource}.
   * This is done in lieu of using an effect.
   */
  function createCursorGetterFromReactiveSource(inputSource: ReactiveSource<SequenceSource<T>>): () => Cursor<T> {
    const $input = coerceSignal(inputSource, options);
    let lastSequence = untracked($input);
    let cachedCursor = sequenceSourceToCursor(lastSequence);
    return () => {
      const currentSequence = untracked($input);
      if (currentSequence !== lastSequence) {
        lastSequence = currentSequence;
        cachedCursor = sequenceSourceToCursor(lastSequence);
      }
      return cachedCursor;
    };
  }
  /** Creates function that gets a cached cursor from a value.  */
  function createCursorGetterFromValue(value: SequenceSource<T>): () => Cursor<T> {
    const cursor = sequenceSourceToCursor(value);
    return () => cursor;
  }

  /** Ensure that there's a first value. */
  function getFirstValue(cursor: Cursor<T>): T {
    const res = cursor.next();
    if (!res.hasValue) {
      throw new Error(ERR_NO_ELEMENTS);
    }
    return res.value;
  }

  /** This should be good enough to narrow down array like objects such as strings. */
  function isArrayLike(value: ArrayLike<T> | Iterable<T>): value is ArrayLike<T> {
    return typeof (value as ArrayLike<T>)['length'] === 'number';
  }

  /** Determines if an object is compatible with a {@link Cursor} by checking for next and rest properties. */
  function isCursor(value: SequenceSource<T>): value is Cursor<T> {
    return typeof value === 'object' && 'next' in value && 'reset' in value;
  }

  /** Converts a {@link SequenceSource} to a {@link Cursor}.  If for some reason it can't be done, throws an error. */
  function sequenceSourceToCursor(data: SequenceSource<T>): Cursor<T> {
    if (isCursor(data)) {
      return data as Cursor<T>;
    }
    const cursor = isArrayLike(data)
      ? new ArrayLikeCursor(data, !options.disableAutoReset)
      : Symbol.iterator in data
      ? new IterableCursor(data, !options.disableAutoReset)
      : undefined;

     if (!cursor) {
      throw new Error(ERR_INVALID_SOURCE);
    }
    return cursor;
  }
}
