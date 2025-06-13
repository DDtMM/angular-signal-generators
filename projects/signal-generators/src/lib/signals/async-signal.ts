import { CreateSignalOptions, Injector, Signal, ValueEqualityFn, computed, effect, isSignal, signal, untracked } from '@angular/core';
import { createSignal } from '@angular/core/primitives/signals';
import { isReactiveSourceFunction } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { TransformedSignal } from '../internal/transformed-signal';
import { asReadonlyFnFactory, getDestroyRef } from '../internal/utilities';
import { ToSignalInput } from '../reactive-source';

/** Either something with a .subscribe() function or a promise. */
export type AsyncSource<T> = ToSignalInput<T> | Promise<T>;

/** Options for {@link asyncSignal}. */
export interface AsyncSignalOptions<T> extends Pick<CreateSignalOptions<T>, 'debugName'> {
  /** The default value before the first emission. */
  defaultValue?: T;
  /** Equal functions run on values emitted from async sources. */
  equal?: ValueEqualityFn<T>;
  /** This is only used if a signal is created from an observable. */
  injector?: Injector;
  /**
   * If true, then the passed value will eagerly be read and it will throw an error if it hasn't been set.
   * You shouldn't use defaultValue in this case.
   */
  requireSync?: boolean;
}

/** An signal that returns values from an async source that can change. */
export type AsyncSignal<T> = TransformedSignal<AsyncSource<T>, T>;

const VOID_FN = () => { /* do nothing */ };

enum AsyncSignalStatus {
  Error,
  Ok,
  NotSet
}

interface AsyncSignalState<T> {
  err?: unknown;
  status: AsyncSignalStatus;
  value: T;
}

export function asyncSignal<T>(
  valueSource: AsyncSource<T>,
  options: AsyncSignalOptions<T> & ({ defaultValue: T; requireSync?: false } | { defaultValue?: undefined; requireSync: true })
): AsyncSignal<T>;
export function asyncSignal<T>(
  valueSource: AsyncSource<T>,
  options?: AsyncSignalOptions<T | undefined> & { defaultValue?: undefined; requireSync?: false }
): AsyncSignal<T | undefined>;
export function asyncSignal<T>(
  valueSource: Signal<AsyncSource<T>> | (() => AsyncSource<T>),
  options: AsyncSignalOptions<T> & ({ defaultValue: T; requireSync?: false } | { defaultValue?: undefined; requireSync: true })
): Signal<T>;
export function asyncSignal<T>(
  valueSource: Signal<AsyncSource<T>> | (() => AsyncSource<T>),
  options?: AsyncSignalOptions<T | undefined> & { defaultValue?: undefined; requireSync?: false }
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
    ? createFromSignal(valueSource, options)
    : isReactiveSourceFunction(valueSource)
    ? createFromReactiveSourceFunction(valueSource, options)
    : createFromValue(valueSource, options);
}

/** Called if this is a function that's NOT a signal to create a readonly AsyncSignal. */
function createFromReactiveSourceFunction<T>(
  reactiveFn: () => AsyncSource<T>,
  options: AsyncSignalOptions<T | undefined>
): Signal<T | undefined> {
  const $input = coerceSignal(reactiveFn, { initialValue: undefined as AsyncSource<T> | undefined, injector: options.injector });
  return createFromSignal($input, options);
}

/** Creates the writable version of an async signal from an initial async source. */
function createFromValue<T>(
  initialSource: AsyncSource<T>,
  options: AsyncSignalOptions<T | undefined>
): AsyncSignal<T | undefined> {
  const [get, set, update] = createSignal(initialSource);
  const $output = createFromSignal(get, options) as AsyncSignal<T | undefined>;
  $output.asReadonly = asReadonlyFnFactory($output);
  $output.set = set;
  $output.update = update;
  return $output;
}

/** Creates a readonly version of an async signal from another signal returning an async source. */
function createFromSignal<T>(
  $input: Signal<AsyncSource<T>>,
  options: AsyncSignalOptions<T | undefined>
): Signal<T | undefined> {
  /**
   * The current source of asynchronous values.
   * Initially this is undefined because we're trying to defer reading the source until the effect first runs.
   * If requireSync is true then it will get the value immediately
   */
  let currentSource: AsyncSource<T> | undefined;
  /** An "unsubscribe" function. */
  let currentListenerCleanupFn: () => void;

  // if requireSync is true, the set the state as NotSet, otherwise it's Ok.  Being NotSet and read will throw an error.
  const $state = signal<AsyncSignalState<T | undefined>>(
    options.requireSync
      ? { status: AsyncSignalStatus.NotSet, value: options.defaultValue }
      : { status: AsyncSignalStatus.Ok, value: options.defaultValue }
  );

  // if requireSync is true then immediately start listening.
  if (options?.requireSync) {
    currentSource = untracked($input);
    currentListenerCleanupFn = updateListener(currentSource);
  } else {
    currentListenerCleanupFn = () => { /* do nothing */ };
  }
  effect(
    () => {
      // Initially this used to only run inside a conditional branch if the state was OK.
      // The problem with that was if another source had an error, the error would bubble up, since we're not catching it.
      const nextSource = $input();
      if (nextSource === currentSource) {
        // don't start listening to an already listened to source.
        // This is only necessary in case requireSync was true and this is the first effect was run.
        return;
      }
      // manually cleanup old listener.
      currentListenerCleanupFn();
      // store the currentSource so it can be used in next invocation of effect.
      currentSource = nextSource;
      // Call the updateListener process and set currentListenerCleanupFn from result.
      // (This is untracked because a signal may be used inside the source and cause additional invocations.)
      currentListenerCleanupFn = untracked(() => updateListener(nextSource));
    },
    { injector: options.injector }
  );

  // Call cleanup on the last listener.  The effect cleanup can't be used because of the risk of initially repeating subscriptions.
  getDestroyRef(asyncSignal, options.injector).onDestroy(() => currentListenerCleanupFn());

  return computed<T | undefined>(
    () => {
      const { err, status, value } = $state();
      switch (status) {
        case AsyncSignalStatus.Error:
          throw new Error('Error in Async Source', { cause: err });
        case AsyncSignalStatus.NotSet:
          throw new Error('requireSync is true, but no value was returned from asynchronous source.');
        case AsyncSignalStatus.Ok:
          return value;
      }
    },
    options // pass along the debugName and equal options.
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
    asyncSource.then(setValue, setError).catch(setError);
    return VOID_FN; // there is no way to cleanup a promise that I know of.

    /** Sets the state of errored if an error hadn't already occurred. */
    function setError(err: unknown): void {
      $state.update((cur) =>
        cur.status === AsyncSignalStatus.Error ? cur : { err, status: AsyncSignalStatus.Error, value: cur.value }
      );
    }
    /** Updates value if the status isn't error. */
    function setValue(value: T): void {
      $state.update((cur) => (cur.status === AsyncSignalStatus.Error ? cur : { status: AsyncSignalStatus.Ok, value }));
    }
  }
}
