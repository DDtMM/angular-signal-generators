import { ElementRef, Injector, Signal, signal } from '@angular/core';
import { getInjector } from '../../internal/utilities';
import { ReactiveSource } from '../../reactive-source';
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
  source: ReactiveSource<ResizeSignalValue>,
  options?: ResizeSignalOptions
): Signal<ResizeObserverEntry[]>;
/**
 * Uses ResizeObserver to observe changes to elements passed to the signal.
 * @param source Either a signal/observable/function that returns Elements or ElementRefs, or a value that is Element or ElementRef.
 * If the source is a value then the signal will be writable.
 * @param options Options for the signal or the ResizeObserver used to monitor changes.
 * @example
 * ```ts
 * const el = document.getElementById('el1');
 * const $obs = resizeSignal(el);
 * effect(() => console.log($obs()[0])); // will output changes to size.
 * el.style.height = '250px';
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
    injector);

}

/** Converts MutationSignalValue to Node.  If it cannot then undefined is returned. */
function getElement(value: ResizeSignalValue): Element | undefined {
  if (value instanceof Element) {
    return value;
  }
  if (value?.nativeElement instanceof Element) {
    return value.nativeElement;
  }
  return undefined;
}
