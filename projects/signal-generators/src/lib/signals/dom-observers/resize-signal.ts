import { ElementRef, Injector, Signal, signal } from '@angular/core';
import { getInjector, hasKey } from '../../internal/utilities';
import { SignalInput } from '../../signal-input';
import { ValueSource } from '../../value-source';
import { domObserverSignalFactory } from './dom-observer-base';

/**
 * Optional injector reference if created outside injector context and MutationObserver options.
 * If no MutationObserver options are passed then only all attributes are observed.
 */
export interface ResizeSignalOptions extends ResizeObserverOptions {
  /** This signal must either be created in an injection context or passed an injector. */
  injector?: Injector;
}
export type ResizeSignalValue = ElementRef | Element | null | undefined;

/** A signal that watches when elements are resized. */
export type ResizeSignal = Signal<ResizeObserverEntry[]> & {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<ResizeObserverEntry[]>;
  /** Sets the new ElementRef to watch and optionally can set options too. */
  set(value: ResizeSignalValue, options?: ResizeObserverOptions): void;
  /** Updates the new Node or ElementRef to watch from the existing value. */
  update(updateFn: (value: ResizeSignalValue) => ResizeSignalValue): void;
};

export function resizeSignal(source: ResizeSignalValue, options?: ResizeSignalOptions): ResizeSignal;
export function resizeSignal(
  source: SignalInput<ResizeSignalValue>,
  options?: ResizeSignalOptions
): Signal<ResizeObserverEntry[]>;
/**
 * Uses MutationObserver to observe changes to nodes passed to the signal.
 * @param source Either a signal/observable/function that returns Nodes or ElementRefs, or a value that is Node or ElementRef.
 * If the source is a value then the signal will be writable.
 * @param options Options for the signal or the MutationObserver used to monitor changes.
 * @example
 * ```ts
 * const mutation = mutationSignal<number>(document.getElementById('el1'));
 * node.setAttribute('data-node-value', 'hello there');
 * console.log(mutation()[0]?.attributeName)); // will log 'data-node-value'
 * ```
 */
export function resizeSignal(
  source: ValueSource<ResizeSignalValue>,
  options?: ResizeSignalOptions
): Signal<ResizeObserverEntry[]> | ResizeSignal {
  if (typeof ResizeObserver === 'undefined') {
    return signal([]); // return a dummy signal that never changes if there is no MutationObserver (like in SSR).
  }
  const injector = options?.injector ?? getInjector(resizeSignal);
  return domObserverSignalFactory<ResizeObserver, ResizeSignalValue, Element>(
    (callback) => new ResizeObserver(callback),
    source,
    options,
    getElement,
    [],
    injector);

}

/** Converts MutationSignalValue to Node.  If it cannot then undefined is returned. */
function getElement(value: ResizeSignalValue): Element | undefined {
  if (value instanceof Element) {
    return value;
  }
  if (hasKey(value, 'nativeElement') && value.nativeElement instanceof Element) {
    return value.nativeElement;
  }
  return undefined;
}
