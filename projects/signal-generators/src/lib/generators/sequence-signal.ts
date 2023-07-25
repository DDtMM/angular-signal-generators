import { Injector, WritableSignal, signal } from '@angular/core';
import { ValueSource, createGetValueFn } from '../value-source';

export interface SequenceSignalOptions {
  /** If true, then the sequence will not loop and restart needs to be called. */
  disableAutoReset?: boolean;
  /** injector should only be necessary if outside injector context and ValueSource is observable. */
  injector?: Injector;
}

export interface SequenceSignal<T> extends WritableSignal<T> {
  /** Updates the signal to the next item in sequence.  If at end and autoRestart is not disabled, then it will return to start. */
  next: () => void;
  /** Updates the signal to the first item in sequence. */
  reset: () => void;
}

export function sequenceSignal<T>(sequence: ValueSource<Iterable<T>>, options: SequenceSignalOptions = {}): SequenceSignal<T> {
  const sequenceItemsInternalFn = createGetValueFn(sequence, options.injector);
  let iterator = sequenceItemsInternalFn()[Symbol.iterator]();
  const output = signal(getFirstValue());

  function getFirstValue(): T {
    const result = iterator.next();
    if (result.done) {
      throw new Error('Sequence must return elements');
    }
    return result.value;
  }
  function updateValue(): void {
    let result = iterator.next();

    if (result.done) {
      // try returning to start.
      if (options.disableAutoReset) {
        return;
      }
      iterator = sequenceItemsInternalFn()[Symbol.iterator]();
      result = iterator.next();
      // new iterator has no result so we can't update Value
      if (result.done) {
        return;
      }
    }

    output.set(result.value);
  }
  return Object.assign(output, {
    next: () => { updateValue(); },
    reset: () => {
      iterator = sequenceItemsInternalFn()[Symbol.iterator]();
      const result = iterator.next();
      if (!result.done) {
        output.set(result.value);
      }
    }
  });
}
