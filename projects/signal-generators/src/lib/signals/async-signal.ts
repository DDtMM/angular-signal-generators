import { Injector, Signal, ValueEqualityFn, computed, effect, isSignal, signal, untracked } from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInputFunction } from '../internal/signal-input-utilities';
import { ToSignalInput } from '../signal-input';

export type AsyncSource<T> = ToSignalInput<T> | Promise<T>;

export interface AsyncSignalOptions<T> {
  /** The default value before the first emission. */
  defaultValue?: T;
  /** Equal functions for values emitted from async sources */
  equal?: ValueEqualityFn<T | undefined>;
  /** This is only used if a signal is created from an observable. */
  injector?: Injector;
}

/** An signal that returns values from an async source that can change. */
export interface AsyncSignal<T> extends Signal<T> {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<T>;
  /** Sets the new async source of the signal. */
  set(value: AsyncSource<T>): void;
  /** Updates the async source of the signal. */
  update(updateFn: (value: AsyncSource<T>) => AsyncSource<T>): void;
}

const VOID_FN = () => {};

enum AsyncSignalStatus {
  Ok,
  Error
}

interface AsyncSignalState<T> {
  err?: unknown;
  status: AsyncSignalStatus;
  value: T;
}

export function asyncSignal<T>(valueSource: AsyncSource<T>, options: AsyncSignalOptions<T> & { defaultValue: T }): AsyncSignal<T>;
export function asyncSignal<T>(
  valueSource: AsyncSource<T>,
  options?: AsyncSignalOptions<T | undefined>
): AsyncSignal<T | undefined>;
export function asyncSignal<T>(
  valueSource: Signal<AsyncSource<T>> | (() => AsyncSource<T>),
  options: AsyncSignalOptions<T> & { defaultValue: T }
): Signal<T>;
export function asyncSignal<T>(
  valueSource: Signal<AsyncSource<T>> | (() => AsyncSource<T>),
  options?: AsyncSignalOptions<T | undefined>
): Signal<T | undefined>;
/**
 * Takes an async source (Promise, Observable) or signal/function that returns an async source
 * and returns that source's values as part of a signal.  Kind of like an rxjs flattening operator.
 * When the async source changes, the old source is immediately released and the new source is listened.
 * @param valueSource A Promise or Subscribable to create writable signal,
 * otherwise a signal or function that returns a Promise or Subscribable.
 * @param options The options for the async signal
 * @returns a signal that returns values from the async source..
 * @example
 * ```ts
 * $id = signal(0);
 * // call getCustomer every time $id changes.
 * $customer = asyncSignal(() => this.$id() !== 0 ? this.getCustomer(this.$id()) : undefined);
 *
 * constructor() {
 *   // writable overload can switch versions.
 *   const artificialWritableExampleSource1 = new BehaviorSubject(1);
 *   const $writable = asyncSignal(artificialWritableExampleSource1);
 *   const artificialWritableExampleSource2 = new BehaviorSubject(2);
 *   $writable.set(artificialWritableExampleSource2);
 * }
 * ```
 */
export function asyncSignal<T>(
  valueSource: AsyncSource<T> | Signal<AsyncSource<T>> | (() => AsyncSource<T>),
  options: AsyncSignalOptions<T | undefined> = {}
): Signal<T | undefined> {
  return isSignal(valueSource)
    ? createOutputSignal(valueSource, options)
    : isSignalInputFunction(valueSource)
    ? createFromSignalInputFunction(valueSource, options)
    : createFromValue(valueSource, options);
}

function createFromSignalInputFunction<T>(
  signalInput: () => AsyncSource<T>,
  options: AsyncSignalOptions<T | undefined>
): Signal<T | undefined> {
  const input = coerceSignal(signalInput, { initialValue: undefined as AsyncSource<T> | undefined, injector: options.injector });
  return createOutputSignal(input, options);
}

function createFromValue<T>(
  initialSource: AsyncSource<T>,
  options: AsyncSignalOptions<T | undefined>
): AsyncSignal<T | undefined> {
  const input = signal(initialSource);
  const output = createOutputSignal(input, options);
  return Object.assign(output, {
    asReadonly: () => output,
    set: input.set.bind(input),
    update: input.update.bind(input)
  });
}

function createOutputSignal<T>(input: Signal<AsyncSource<T>>, options: AsyncSignalOptions<T | undefined>): Signal<T | undefined> {
  /** An "unsubscribe" function. */
  let previousListenerCleanup: () => void = VOID_FN;

  const state = signal<AsyncSignalState<T | undefined>>({ status: AsyncSignalStatus.Ok, value: options.defaultValue });

  effect(
    () => {
      previousListenerCleanup();
      if (untracked(state).status === AsyncSignalStatus.Ok) {
        // by nesting this inside Ok branch, the effect will only be called one when the state turns to error.
        const inputValue = input();
        // this is untracked because a signal may be used inside.
        previousListenerCleanup = untracked(() => updateListener(inputValue));
      }
      return previousListenerCleanup;
    },
    { injector: options.injector }
  );

  return computed<T | undefined>(
    () => {
      const { err, status, value } = state();
      switch (status) {
        case AsyncSignalStatus.Error:
          throw new Error('Error in Async Source', { cause: err });
        case AsyncSignalStatus.Ok:
          return value;
      }
    },
    { equal: options.equal }
  );

  /** Starts listening to the new async value, and returns the cleanup function. */
  function updateListener(asyncSource: AsyncSource<T>): () => void {
    // This was removed because it was confusing that a value could be a subscribable and a subscribable could be converted to a signal.
    // if (asyncSource === undefined) {
    //   return VOID_FN; // don't listen to anything and return a dummy unsubscribe function.
    // }
    if ('subscribe' in asyncSource) {
      const unsubscribe = asyncSource.subscribe({ error: setError, next: setValue });
      return () => unsubscribe.unsubscribe();
    }
    asyncSource.then(setValue, setError);
    return VOID_FN;

    /** Sets the state of errored if an error hadn't already occurred. */
    function setError(err: unknown): void {
      state.update((cur) =>
        cur.status === AsyncSignalStatus.Error ? cur : { err, status: AsyncSignalStatus.Error, value: cur.value }
      );
    }
    /** Updates value if the status isn't error. */
    function setValue(value: T): void {
      state.update((cur) => (cur.status === AsyncSignalStatus.Error ? cur : { status: AsyncSignalStatus.Ok, value }));
    }
  }
}
