import { Injector, Signal, ValueEqualityFn, WritableSignal, computed, signal } from '@angular/core';
import { ValueSource } from 'signal-generators';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { SignalInput } from '../signal-input';

export interface FilterSignalOptions<O> {
  /** Equality Check. */
  equal?: ValueEqualityFn<O | undefined>;
  /** This is only used if a signal is created from an observable. */
  injector?: Injector;
}

export interface FilterSignalOptionsWithValue<O> extends Omit<FilterSignalOptions<O>, 'equal'> {
  /** Equality Check. */
  equal?: ValueEqualityFn<O>;
  /** Provide this if the initial value could fail from the guard. */
  initialValidValue: O;
}

export type FilterSignal<T, O = T> = Signal<O> & Omit<WritableSignal<O>, 'set' | 'update'> & {
  /** Sets the new value IF it is compatible with the filter function. */
  set(value: T): void;
  /** Updates the signal's value IF it is compatible with the filter function. */
  update(updateFn: (value: O) => T): void;
};


export function filterSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options: FilterSignalOptionsWithValue<O>): Signal<O>
export function filterSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): Signal<O | undefined>
export function filterSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options: FilterSignalOptionsWithValue<O>): Signal<O>
export function filterSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): Signal<O | undefined>
export function filterSignal<T, O extends T>(initialValue: O, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): FilterSignal<T, O>
export function filterSignal<O>(initialValue: O, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): FilterSignal<O>
export function filterSignal<T, O extends T>(source: ValueSource<O>, filterFn: (x: T) => boolean, options: FilterSignalOptions<O> & Omit<Partial<FilterSignalOptionsWithValue<O>>, 'equal'> = {}): Signal<O | undefined> {
  return (isSignalInput(source))
    ? filterSignalFromSignal(source, filterFn, options)
    : filterSignalFromValue(source, filterFn, options);

}


function filterSignalFromValue<T, O extends T>(initialValue: O, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): FilterSignal<T, O>
function filterSignalFromValue<O>(initialValue: O, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): FilterSignal<O>
function filterSignalFromValue<T, O extends T>(initialValue: O, filterFn: (x: T) => boolean, options?: FilterSignalOptions<O>): FilterSignal<T, O> {
  const internal = signal<O>(initialValue, options);
  const setFn = internal.set;

  return Object.assign(internal, {
    set: (x: T) => setConditionally(setFn, x, filterFn),
    update: (signalUpdateFn: (x: T) => T) => setConditionally(setFn, signalUpdateFn(internal()), filterFn)
  });

  function setConditionally<T, O extends T>(setter: (value: O) => void, value: T, filterFn: (x: T) => boolean): void {
    if (filterFn(value)) {
      setter(value as O);
    }
  }
}

function filterSignalFromSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options: FilterSignalOptionsWithValue<O>): Signal<O>
function filterSignalFromSignal<T, O extends T>(source: SignalInput<T>, filterFn: (x: T) => x is O, options?: FilterSignalOptions<O>): Signal<O | undefined>
function filterSignalFromSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options: FilterSignalOptionsWithValue<O>): Signal<O>
function filterSignalFromSignal<O>(source: SignalInput<O>, filterFn: (x: O) => boolean, options?: FilterSignalOptions<O>): Signal<O | undefined>
function filterSignalFromSignal<T, O extends T>(source: SignalInput<O>, filterFn: (x: T) => boolean, options?: FilterSignalOptions<O> & Omit<Partial<FilterSignalOptionsWithValue<O>>, 'equal'>): Signal<O | undefined> {
  const sourceSignal = coerceSignal(source, options);
  let validValue = !filterFn(sourceSignal()) ? options?.initialValidValue : sourceSignal();
  return computed(() => {
    const currentValue = sourceSignal();
    if (filterFn(currentValue)) {
      validValue = currentValue;
    }
    return validValue;
  }, options);

}

