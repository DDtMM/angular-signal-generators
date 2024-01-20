import { DestroyRef, Injector, Signal, effect } from '@angular/core';
import { getInjector } from '../internal/utilities';

type PromiseParams<T> = Parameters<ConstructorParameters<typeof Promise<T>>[0]>;

export interface SignalToIteratorOptions {
  /** pass injector if this is not created in Injection Context */
  injector?: Injector;
}
/**
 * Creates an async iterator for a signal.
 * @param source The signal to create an async iterator for.
 * @param options Options for the signal.
 * @example
 * ```ts
 * // assumes this is within a component
 * readonly source = signal('initial');
 * constructor() {
 *   for await (const item of signalToIterator(this.source)) {
 *     console.log(item); // 'initial', 'next';
 *   }
 *   this.source.set('next');
 * }
 * ```
 */
export function signalToIterator<T>(source: Signal<T>, options?: SignalToIteratorOptions): Required<AsyncIterableIterator<T>> {
  /** The value of done that can be changed by complete. */
  let doneValue: unknown = undefined;
  /** Stores the first value which is necessary only for preventing double initial emissions. */
  const initialValue = source();
  /** The injector in which the effect in which this function is part of. */
  const injector = options?.injector ?? getInjector(signalToIterator);
  /** Necessary in case there are any additional calls to the returned iterator's .next() but watcher has been destroyed. */
  let isDone = false;
  /** Necessary to check if the first value had been emitted already. */
  let isFirstEffectComplete = false;
  /** Promises that have been created that are waiting to be resolved or rejected because next has been called. */
  const unresolvedQueue: PromiseParams<IteratorResult<T>>[] = [];
  /** Values that have already been retrieved before next has been called. */
  const unyieldedQueue: IteratorResult<T>[] = [];

  // add initial result;
  addResult({ done: false, value: initialValue });

  const watcher = effect(() => {
    const value = source();
    if (isFirstEffectComplete) {
      addResult({ done: false, value });
    }
    else {
      // to ensure the first element is emitted it was immediately added.
      // The issue is that we have to skip the first effect emission.
      // But the value could have changed!
      // This could have a bug with equality if the intention was to emit a value that was the same.
      isFirstEffectComplete = true;
      if (value !== initialValue) {
        addResult({ done: false, value });
      }
    }
  }, { injector, manualCleanup: true });

  injector.get(DestroyRef)
    .onDestroy(() => complete(([resolve]) => resolve({ done: true, value: doneValue })));

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next(): Promise<IteratorResult<T>> {
      if (unyieldedQueue.length > 0) {
        return Promise.resolve(unyieldedQueue.shift() as IteratorResult<T>);
      } else if (isDone) {
        return Promise.resolve({ done: true, value: doneValue });
      }
      return new Promise((resolve, reject) => unresolvedQueue.push([resolve, reject]));
    },
    return: (value?: unknown) => {
      doneValue = value;
      complete(([resolve]) => resolve({ done: true, value })); // resolve outstanding promises
      return Promise.resolve({ done: true as const, value });
    },
    throw: (err?: unknown): Promise<IteratorResult<T>> => {
      complete(([, reject]) => reject(err)); // reject outstanding promises
      return Promise.reject(err);
    },
  };

  /** Either resolves a waiting promise or adds a result to resolve later. */
  function addResult(result: IteratorResult<T>): void  {
    if (unresolvedQueue.length > 0) {
      const [resolve] = unresolvedQueue.shift() as PromiseParams<IteratorResult<T>>;
      resolve(result);
    } else {
      unyieldedQueue.push(result);
    }
  };

  /** Runs cleanup when either the return method is called or injection context is destroyed */
  function complete(unresolvedAction: (elem: typeof unresolvedQueue[number]) => void): void {
    // we need to have this check since this can be completed by more than one event.
    if (!isDone) {
      watcher.destroy();
      isDone = true;
      if (unresolvedQueue.length > 0) {
        flushQueue(unresolvedQueue, unresolvedAction);
      }
      else {
        addResult({ done: true, value: doneValue }); // make sure a done result is returned.
      }
    }
  }

  /** Removes all elements of the queue calling callback after each element is removed */
  function flushQueue<T>(queue: T[], callback: (value: T) => void): void {
    while (queue.length > 0) {
      callback(queue.shift() as T);
    }
  }
}
