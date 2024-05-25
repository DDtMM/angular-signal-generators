import { ElementRef, Injector, Signal, signal } from '@angular/core';
import { getInjector, hasKey } from '../../internal/utilities';
import { SignalInput } from '../../signal-input';
import { ValueSource } from '../../value-source';
import { domObserverSignalFactory } from './dom-observer-base';

/**
 * Optional injector reference if created outside injector context and MutationObserver options.
 * If no MutationObserver options are passed then only all attributes are observed.
 */
export interface MutationSignalOptions extends MutationObserverInit {
  /** This signal must either be created in an injection context or passed an injector. */
  injector?: Injector;
}
export type MutationSignalValue = ElementRef | Node | null | undefined;

/** A signal that watches changes to nodes or elements. */
export type MutationSignal = Signal<MutationRecord[]> & {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<MutationRecord[]>;
  /** Sets the new Node or ElementRef to watch.  Can optionally update options. */
  set(value: MutationSignalValue, options?: MutationObserverInit): void;
  /** Updates the new Node or ElementRef to watch from the existing value. */
  update(updateFn: (value: MutationSignalValue) => MutationSignalValue): void;
};

export function mutationSignal(source: MutationSignalValue, options?: MutationSignalOptions): MutationSignal;
export function mutationSignal(
  source: SignalInput<MutationSignalValue>,
  options?: MutationSignalOptions
): Signal<MutationRecord[]>;
/**
 * Uses MutationObserver to observe changes to nodes passed to the signal.
 * @param source Either a signal/observable/function that returns Nodes or ElementRefs, or a value that is Node or ElementRef.
 * If the source is a value then the signal will be writable.
 * @param options Options for the signal or the MutationObserver used to monitor changes.
 * @example
 * ```ts
 * const el = document.getElementById('el1');
 * const $obs = mutationSignal(el);
 * effect(() => console.log($obs()[0]?.attributeName)); // will log 'data-node-value'
 * el.setAttribute('data-node-value', 'hello there');
 * ```
 */
export function mutationSignal(
  source: ValueSource<MutationSignalValue>,
  options?: MutationSignalOptions
): Signal<MutationRecord[]> | MutationSignal {
  if (typeof MutationObserver === 'undefined') {
    return signal([]); // return a dummy signal that never changes if there is no MutationObserver (like in SSR).
  }

  const injector = options?.injector ?? getInjector(mutationSignal);
  return domObserverSignalFactory<MutationObserver, MutationSignalValue, Node>(
    (callback) => new MutationObserver(callback),
    source,
    getObserverOptions(options),
    getNode,
    injector);

}

/**
 * Extracts Observer options from Signal Options.
 * If no options are passed then a default of attributes is used.
 */
function getObserverOptions(options: MutationSignalOptions | undefined): MutationObserverInit {
  // careful here.
  // The logic is to return default mutationObserver options if the only options are a non-mutation one.
  if (options === undefined || Object.keys(options).every((x) => x === 'injector')) {
    return { attributes: true };
  }
  return options; // it's probably safe to return options directly.
}

/** Converts MutationSignalValue to Node.  If it cannot then undefined is returned. */
function getNode(value: MutationSignalValue): Node | undefined {
  if (value instanceof Node) {
    return value;
  }
  if (hasKey(value, 'nativeElement') && value.nativeElement instanceof Node) {
    return value.nativeElement;
  }
  return undefined;
}
