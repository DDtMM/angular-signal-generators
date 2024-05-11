import { ElementRef, Injector, Signal, signal } from '@angular/core';
import { getInjector, hasKey } from '../../internal/utilities';
import { SignalInput } from '../../signal-input';
import { ValueSource } from '../../value-source';
import { domObserverSignalFactory } from './dom-observer-base';

/**
 * Optional injector reference if created outside injector context and MutationObserver options.
 * If no MutationObserver options are passed then only all attributes are observed.
 */
export interface IntersectionObserverOptions extends Omit<IntersectionObserverInit, 'root'> {
  /** This signal must either be created in an injection context or passed an injector. */
  injector?: Injector;

  /** The root element where intersections will be observed. */
  root?: Document | ElementRef | Element | null | undefined;
}
export type IntersectionSignalValue = ElementRef | Element | null | undefined;

/** A signal that watches when elements are resized. */
export type IntersectionSignal = Signal<IntersectionObserverEntry[]> & {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<IntersectionObserverEntry[]>;
  /** Sets the new ElementRef to watch. */
  set(value: IntersectionSignalValue): void;
  /** Updates the new Node or ElementRef to watch from the existing value. */
  update(updateFn: (value: IntersectionSignalValue) => IntersectionSignalValue): void;
};

export function intersectionSignal(source: IntersectionSignalValue, options?: IntersectionObserverOptions): IntersectionSignal;
export function intersectionSignal(
  source: SignalInput<IntersectionSignalValue>,
  options?: IntersectionObserverOptions
): Signal<IntersectionObserverEntry[]>;
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
export function intersectionSignal(
  source: ValueSource<IntersectionSignalValue>,
  options?: IntersectionObserverOptions
): Signal<IntersectionObserverEntry[]> | IntersectionSignal {
  if (typeof IntersectionObserver === 'undefined') {
    return signal([]); // return a dummy signal that never changes if there is no MutationObserver (like in SSR).
  }
  const injector = options?.injector ?? getInjector(intersectionSignal);
  return domObserverSignalFactory<IntersectionObserver, IntersectionSignalValue, Element>(
    (callback) => {
      const nativeOptions: IntersectionObserverInit | undefined = options ? { ...options, root: getRoot(options.root) } : undefined;
      return new IntersectionObserver(callback, nativeOptions);
    },
    source,
    undefined, // intersection observer options never change
    getElement,
    [],
    injector);

}
/** Converts IntersectionSignalValue to Element.  If it cannot then undefined is returned. */
function getRoot(value: IntersectionObserverOptions['root']): Document | Element | undefined {
  if (value instanceof Element || value instanceof Document) {
    return value;
  }
  if (hasKey(value, 'nativeElement') && value.nativeElement instanceof Element) {
    return value.nativeElement;
  }
  return undefined;
}
/** Converts IntersectionSignalValue to Element.  If it cannot then undefined is returned. */
function getElement(value: IntersectionSignalValue): Element | undefined {
  if (value instanceof Element) {
    return value;
  }
  if (hasKey(value, 'nativeElement') && value.nativeElement instanceof Element) {
    return value.nativeElement;
  }
  return undefined;
}
