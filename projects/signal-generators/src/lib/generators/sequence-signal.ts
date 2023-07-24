import { Injector, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { hasKey } from '../internal/utilities';
import { SignalInput } from '../signal-input';
import { ValueSource, createGetValueFn } from '../value-source';
import { ValueSourceGetValueFn } from 'signal-generators';

export interface SequenceSignalOptions<T> {
  /** The value to put in the first.  If not provided the first element in sequence will be used. */
  initialValue?: T;
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}

export interface SequenceSignal<T> extends WritableSignal<T> {
  /** Updates the signal to the next item in sequence. */
  next: () => void;
  /** Updates the signal to the previous item in sequence. */
  previous: () => void;
  /** Updates the signal to the first
   *  item in sequence. */
  reset: () => void;
}

export interface SequenceSignalState<T> extends WritableSignal<T> {
  action: string;
  index: number;
  items: T[];
  value: T;
}
/**
 * A writable signal that can be traversed with methods.
 */
export function sequenceSignal<T>(sequence: ValueSource<T[]>, options?: SequenceSignalOptions<T>) {
  const sequenceItemsInternalFn = createGetValueFn(sequence, options?.injector);
  const sequenceItemsFn = computed(() => {
    const items = sequenceItemsInternalFn();
    assertHasSequenceItems(items);
    return items;
  })
  const initialItems = sequenceItemsFn();
  const state = signal<SequenceSignalState<T>>({ action: 'init', index: 0, items: initialItems, value: options?.initialValue ?? initialItems[0] });
}

function assertHasSequenceItems<T>(sequenceItems: T[]): boolean {
  if (sequenceItems.length === 0) {
    throw new Error('There are no items in sequence.');
  }
  return true;
}

/** Assigns timer functions to the signal. */
function bindSignalFunctions<T>(state: SequenceSignalState<T>, output: WritableSignal<T>, sequenceItemsFn: ValueSourceGetValueFn<T[]>): SequenceSignal<T> {
  return Object.assign(output, {
    next: () => updateRelativeValue(1),
    previous: () => updateRelativeValue(-1),
    reset: () => {
      const items = sequenceItemsFn();
      assertHasSequenceItems(items);
      return items[0];
    }
  });


  function updateRelativeValue(relativeIndex: number): void {
    state.update(value => {
      const items = sequenceItemsFn();
      assertHasSequenceItems(items);
      const currentIndex = items.indexOf(value);
      const nextIndex = (currentIndex + relativeIndex) % length;
      return items[nextIndex];
    });
  }
}
