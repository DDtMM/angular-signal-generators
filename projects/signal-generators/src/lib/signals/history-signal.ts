import { CreateSignalOptions, Injector, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { SIGNAL, createSignal, signalSetFn } from '@angular/core/primitives/signals';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { asReadonlyFnFactory, setDebugNameOnNode, setEqualOnNode } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource } from '../value-source';

export interface HistorySignalOptions<T> extends CreateSignalOptions<T> {
  /** Needed when a reactive source is used and historySignal is created outside an injection context. */
  injector?: Injector;
  /** Maximum number of prior values retained. Defaults to 100. */
  limit?: number;
}

/** A signal that retains prior values and supports undo and redo. */
export interface HistorySignal<T> extends Signal<T> {
  /** Whether an earlier value can be restored. */
  canUndo: Signal<boolean>;
  /** Whether an undone value can be restored. */
  canRedo: Signal<boolean>;
  /** Removes all retained undo and redo values without changing the current value. */
  clearHistory(): void;
  /** Restores the next value in the redo history. Returns whether a value was restored. */
  redo(): boolean;
  /** Restores the most recent prior value. Returns whether a value was restored. */
  undo(): boolean;
}

/** A writable {@link HistorySignal}. */
export interface WritableHistorySignal<T> extends HistorySignal<T>, Pick<WritableSignal<T>, 'set' | 'update' | 'asReadonly'> {}

/**
 * Creates a history signal from a reactive source.
 * Source changes are observed by an effect, so multiple synchronous emissions may be
 * coalesced by Angular and not every intermediate value is guaranteed to be recorded.
 * @param source The reactive source whose observed values are recorded.
 * @param options Signal options and the maximum retained history length.
 * @example
 * ```ts
 * const source = signal(0);
 * const count = historySignal(source);
 * source.set(1);
 * // After effects run, count() is 1 and count.undo() restores 0.
 * ```
 */
export function historySignal<T>(source: ReactiveSource<T>, options?: HistorySignalOptions<T>): HistorySignal<T>;
/**
 * Creates a writable signal that records changes for undo and redo.
 * Setting a value after undoing clears the redo history. Values considered equal by
 * `options.equal` are not recorded.
 * @param initialValue The signal's initial value.
 * @param options Signal options and the maximum retained history length.
 * @example
 * ```ts
 * const count = historySignal(0);
 * count.set(1);
 * count.set(2);
 * count.undo(); // count() is 1
 * count.redo(); // count() is 2
 * ```
 */
export function historySignal<T>(initialValue: T, options?: HistorySignalOptions<T>): WritableHistorySignal<T>;
/** Creates a history signal from either a value or a reactive source. */
export function historySignal<T>(source: ValueSource<T>, options: HistorySignalOptions<T> = {}): HistorySignal<T> | WritableHistorySignal<T> {
  if (isReactive(source)) {
    const $source = coerceSignal(source, options);
    const $output = createHistorySignal(untracked($source), options);
    effect(() => {
      const value = $source();
      untracked(() => setHistoryValue($output, value));
    }, options);
    return $output;
  }

  const $output = createHistorySignal(source, options) as WritableHistorySignal<T>;
  $output.asReadonly = asReadonlyFnFactory($output);
  $output.set = (value: T) => setHistoryValue($output, value);
  $output.update = (updateFn: (value: T) => T) => $output.set(updateFn($output()));
  return $output;
}

const setHistoryValueSymbol = Symbol('setHistoryValue');
type InternalHistorySignal<T> = HistorySignal<T> & { [setHistoryValueSymbol](value: T): void };

function setHistoryValue<T>($history: HistorySignal<T>, value: T): void {
  ($history as InternalHistorySignal<T>)[setHistoryValueSymbol](value);
}

function createHistorySignal<T>(initialValue: T, options: HistorySignalOptions<T>): HistorySignal<T> {
  const limit = options.limit ?? 100;
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('historySignal limit must be a non-negative integer.');
  }

  const equal = options.equal ?? Object.is;
  const [get] = createSignal(initialValue);
  const $output = get as InternalHistorySignal<T>;
  const $canUndo = signal(false, { debugName: options.debugName ? `${options.debugName}.canUndo` : undefined });
  const $canRedo = signal(false, { debugName: options.debugName ? `${options.debugName}.canRedo` : undefined });
  const past: T[] = [];
  const future: T[] = [];

  setDebugNameOnNode(get[SIGNAL], options.debugName);
  setEqualOnNode(get[SIGNAL], options.equal);

  const updateAvailability = () => {
    $canUndo.set(past.length > 0);
    $canRedo.set(future.length > 0);
  };
  const setCurrent = (value: T) => signalSetFn(get[SIGNAL], value);

  $output.canUndo = $canUndo.asReadonly();
  $output.canRedo = $canRedo.asReadonly();
  $output.clearHistory = () => {
    past.length = 0;
    future.length = 0;
    updateAvailability();
  };
  $output[setHistoryValueSymbol] = (value: T) => {
    const current = get();
    if (equal(current, value)) {
      return;
    }
    if (limit > 0) {
      past.push(current);
      if (past.length > limit) {
        past.shift();
      }
    }
    future.length = 0;
    setCurrent(value);
    updateAvailability();
  };
  $output.undo = () => {
    if (past.length === 0) {
      return false;
    }
    const value = past.pop() as T;
    future.push(get());
    setCurrent(value);
    updateAvailability();
    return true;
  };
  $output.redo = () => {
    if (future.length === 0) {
      return false;
    }
    const value = future.pop() as T;
    past.push(get());
    setCurrent(value);
    updateAvailability();
    return true;
  };

  return $output;
}
