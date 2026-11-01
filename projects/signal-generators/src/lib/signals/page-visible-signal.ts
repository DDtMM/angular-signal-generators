import { CreateSignalOptions, Injector, Signal, signal } from '@angular/core';
import { getDestroyRef } from '../internal/utilities';

/** Options for {@link pageVisibleSignal}. */
export interface PageVisibleSignalOptions extends Pick<CreateSignalOptions<unknown>, 'debugName'> {
  /** This is only necessary if called outside an injection context. */
  injector?: Injector;
}

/**
 * Creates a readonly signal that reports whether the page is visible.
 * The value comes from {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState | document.visibilityState}.
 * Listens to the document's visibilitychange event until the injection context is destroyed.
 * Returns true for visible, false for hidden, and undefined when document or its visibility state is unavailable.
 * Page visibility does not indicate whether the document has focus.
 * @param options Options used when creating the signal. Pass an injector if outside an injection context.
 * @example
 * ```ts
 * const $pageVisible = pageVisibleSignal();
 * effect(() => console.log($pageVisible())); // true, false, or undefined.
 * ```
 */
export function pageVisibleSignal(options?: PageVisibleSignalOptions): Signal<boolean | undefined> {
  const target = globalThis.document;
  if (!target) {
    return signal<boolean | undefined>(undefined, options).asReadonly();
  }

  const destroyRef = getDestroyRef(pageVisibleSignal, options?.injector);
  const $output = signal<boolean | undefined>(getVisibility(), options);
  const onVisibilityChange = () => $output.set(getVisibility());
  target.addEventListener('visibilitychange', onVisibilityChange);
  destroyRef.onDestroy(() => target.removeEventListener('visibilitychange', onVisibilityChange));
  return $output.asReadonly();

  /** Maps the document's visibility state to a boolean, preserving an unknown state. */
  function getVisibility(): boolean | undefined {
    switch (target.visibilityState) {
      case 'visible': return true;
      case 'hidden': return false;
      default: return undefined;
    }
  }
}
