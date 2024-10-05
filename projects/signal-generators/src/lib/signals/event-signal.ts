/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DestroyRef,
  effect,
  ElementRef,
  Injector,
  RendererFactory2,
  Signal,
  signal,
  untracked,
  ValueEqualityFn
} from '@angular/core';
import { coerceSignal } from '../internal/signal-coercion';
import { isSignalInput } from '../internal/signal-input-utilities';
import { getInjector } from '../internal/utilities';
import { ValueSource } from '../value-source';

/** Options for {@link eventSignal}. */
export interface EventSignalOptions<T> {
  /** An equal function put on the selector result. */
  equal?: ValueEqualityFn<T | undefined>;
  /** The initial value until the first emission. */
  initialValue?: unknown;
  /** Needed if not created in injection context. */
  injector?: Injector;
}

/** Anything Renderer2 can listen to plus ElementRef. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventSignalTarget = 'window' | 'document' | 'body' | ElementRef | any;

const DUMMY_FN = () => {};

/**
 * Creates a signal that listens to a DOM object event and maps the event to a value, initially returning undefined if default is not set.
 * Requires being in an injection context.
 * @example
 * ```ts
 * const $viewElem = viewChild('div');
 * const $bodyEvent = eventSignal('body', 'click', (event) => event.clientX);
 * const $divEvent = eventSignal($viewElem, 'click', (event) => event.clientX);
 * effect(() => console.log(`body: ${$bodyEvent()}`)); // initially undefined.
 * effect(() => console.log(`div: ${$divEvent()}`)); // initially undefined.
 * ```
 * @param T The type of the return value from the signal which comes from the selector or initialValue if provided.
 * @param source The source the contains the target to listen to.  Can be window, document, body, or an element ref, or anything else Renderer2 can listen to.
 * @param eventName The name of the event to listen to.
 * @param selector The selector to run when the event is emitted that will be output by the signal.
 * @param options Options used when creating the signal.
 */
export function eventSignal<T>(
  source: ValueSource<EventSignalTarget>,
  eventName: string,
  selector: (event: any) => T,
  options?: EventSignalOptions<T> & { initialValue?: undefined }
): Signal<T | undefined>;
/**
 * Creates a signal that listens to a DOM object event and maps the event to a value.
 * Requires being in an injection context.
 * @example
 * ```ts
 * const $viewElem = viewChild('div');
 * const $bodyEvent = eventSignal('body', 'click', (event) => event.clientX, { initialValue: 0 });
 * const $divEvent = eventSignal($viewElem, 'click', (event) => event.clientX, { initialValue: 0 });
 * effect(() => console.log(`body: ${$bodyEvent()}`)); // initially 0.
 * effect(() => console.log(`div: ${$divEvent()}`)); // initially 0.
 * ```
 * @param T The type of the return value from the signal which comes from the selector or initialValue.
 * @param source The source the contains the target to listen to.  Can be window, document, body, or an element ref, or anything else Renderer2 can listen to.
 * @param eventName The name of the event to listen to.
 * @param selector The selector to run when the event is emitted that will be output by the signal.
 * @param options Options used when creating the signal.
 */
export function eventSignal<T>(
  source: ValueSource<EventSignalTarget>,
  eventName: string,
  selector: (event: any) => T,
  options: EventSignalOptions<T> & { initialValue: T }
): Signal<T>;
/**
 * Creates a signal that listens to a DOM object event and returns that event.
 * Requires being in an injection context.
 * @example
 * ```ts
 * const $viewElem = viewChild('div');
 * const $bodyEvent = eventSignal('body', 'click');
 * const $divEvent = eventSignal($viewElem, 'click');
 * // The following emit HTML events:
 * effect(() => console.log(`body: ${$bodyEvent()}`));
 * effect(() => console.log(`div: ${$divEvent()}`));
 * ```
 * @param source The source the contains the target to listen to.  Can be window, document, body, or an element ref, or anything else Renderer2 can listen to.
 * @param eventName The name of the event to listen to.
 * @param options Options used when creating the signal.
 */
export function eventSignal(
  source: ValueSource<EventSignalTarget>,
  eventName: string,
  options?: EventSignalOptions<any> & { initialValue?: any }
): Signal<any>;
export function eventSignal<T>(
  source: ValueSource<EventSignalTarget>,
  eventName: string,
  selectorOrOptions: ((event: any) => T) | EventSignalOptions<T> | undefined,
  optionsWhenSelectorPresent?: EventSignalOptions<T> & { initialValue?: T }
): Signal<T> {
  const [selector, options] = resolveSelectorAndOptions();
  const injector = options?.injector ?? getInjector(eventSignal);
  const $output = signal<T>(options?.initialValue as T, options);
  const destroyRef = injector.get(DestroyRef);
  const renderer = injector.get(RendererFactory2).createRenderer(null, null);
  let destroyEventListener: () => void = DUMMY_FN;

  if (isSignalInput(source)) {
    listenToSignal(coerceSignal(source, options));
  } else {
    listenToValue(source);
  }
  destroyRef.onDestroy(() => {
    renderer.destroy();
    destroyEventListener();
  });
  return $output;

  function resolveSelectorAndOptions(): [(event: any) => T, EventSignalOptions<T> | undefined] {
    if (typeof selectorOrOptions === 'function') {
      return [selectorOrOptions, optionsWhenSelectorPresent];
    } else {
      return [(evt: any) => evt, selectorOrOptions];
    }
  }
  function listenToValue(target: EventSignalTarget) {
    const targetListenable = coerceListenable(target);
    if (!targetListenable) {
      // console.warn('An undefined object was passed to eventSignal. It will not be listened to.');
      destroyEventListener = DUMMY_FN;
      return;
    }
    destroyEventListener = renderer.listen(targetListenable, eventName, (event) => {
      const nextValue = untracked(() => selector(event));
      $output.set(nextValue);
    });
  }

  function listenToSignal($target: Signal<EventSignalTarget>): void {
    effect(
      (onCleanup) => {
        destroyEventListener();
        listenToValue($target());
        onCleanup(() => {
          destroyEventListener();
          // make sure event unlistener is a dummy function incase there are any ramifications for double calling.
          destroyEventListener = DUMMY_FN;
        });
      },
      { injector }
    );
  }
}

/** If target is elementRef then returns nativeElement, otherwise returns target */
function coerceListenable(target: EventSignalTarget): HTMLElement | string | unknown {
  if (target instanceof ElementRef) {
    return target.nativeElement;
  }
  return target;
}

// THIS SEEMED UNNECESSARY:  Never encountered a scenario where Renderer2 could be injected.
// /** The theory here is that if inside component Renderer can be injected without the need of RendererFactory. */
// function injectRenderer(injector: Injector): [render: Renderer2, destroy: () => void] {
//   // if renderer exists in context already then there is no reason to create it again.
//   // so we can return it with a dummy destroyer.
//   let renderer = injector.get(Renderer2, null, { optional: true });
//   if (renderer) {
//     return [renderer, () => {}];
//   }
//   const rendererFactory = injector.get(RendererFactory2);
//   renderer = rendererFactory.createRenderer(null, null);
//   const destroy = () => renderer.destroy();
//   return [renderer, destroy];
// }
