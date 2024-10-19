import { effect, Injector, untracked } from '@angular/core';
import { createSignal, SIGNAL, SignalGetter, SignalNode, signalSetFn } from '@angular/core/primitives/signals';
import { DestroyableSignal } from '../destroyable-signal';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { TransformedSignal } from '../internal/transformed-signal';
import { asReadonlyFnFactory, getDestroyRef } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource } from '../value-source';

/** The latest state of a MediaQueryList. */
export type MediaQueryState = Pick<MediaQueryList, 'matches' | 'media'>;

/** Options for {@link mediaQuerySignal} when generating values from another reactive source. */
export interface MediaQuerySignalOptions {
  /** When passed another reactive source then this needs to be passed if outside injector context since this signal relies on effect.  */
  injector?: Injector;
}
/** Options for {@link mediaQuerySignal} when using writeable overload. */
export interface MediaQueryWriteableSignalOptions {
  /** This is only necessary if called outside injector context and {@link manualDestroy} is not true. */
  injector?: Injector;
  /**
   * Whether this will be destroyed manually instead of when the injection context is destroyed.
   * If true, this signal does not have to be created in an injection context,
   * and {@link MediaQuerySignal.destroy} should be called when or if it is time to release resources.
   */
  manualDestroy?: boolean;
}
/** A writeable signal created from {@link MediaQuerySignal}. */
export interface MediaQuerySignal extends TransformedSignal<string, MediaQueryState>, DestroyableSignal<MediaQueryState> { }

export function mediaQuerySignal(
  querySource: ReactiveSource<string>,
  options?: MediaQuerySignalOptions
): DestroyableSignal<MediaQueryState>;
export function mediaQuerySignal(querySource: string, options?: MediaQueryWriteableSignalOptions): MediaQuerySignal;
/**
 * Creates a signal that determines if a document matches a given media query.
 * This uses {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia | window.matchMedia} internally.
 * @param querySource For a writable signal pass a string, otherwise a {@link ReactiveSource} that returns queries as a string.
 * @param options An optional object that affects behavior of the signal.
 * @example
 * ```ts
 * // As a writable signal.
 * const $orientationQry = mediaQuerySignal('(orientation: portrait)');
 * effect(() => console.log(`browser is in ${$orientationQry().matches ? 'portrait' : 'landscape'} orientation`));
 * // from another signal.
 * const $querySource = signal(`(min-width: 992px)`);
 * const $widthQry = mediaQuerySignal($querySource);
 * effect(() => console.log(`browser is in ${$widthQry().matches ? 'large' : 'small'} screen`));
 * ```
 */
export function mediaQuerySignal(
  querySource: ValueSource<string>,
  options?: MediaQueryWriteableSignalOptions
): DestroyableSignal<MediaQueryState> | MediaQuerySignal {
  if (!globalThis.matchMedia) {
    return createDummyOutput('matchMedia is not supported');
  }

  /** The cleanup function for the active MediaQueryList.change eventListener. */
  let cleanupFn: () => void = () => { /* do nothing */ };
  /** When true, no more changes should be observed. */
  let isDestroyed = false;
  return isReactive(querySource) ? createFromReactiveSource(querySource) : createFromValue(querySource);

  /**
   * Creates the output signal from a {@link ReactiveSource}.
   * This is currently done with an effect, but it might be okay if it were done from a computed signal.
   * The only caveat is that there would have to be a side-effect every time the query changed:
   * A new matchMedia query would have to be created, and the event subscribed to.
   * This is probably okay because it should be asynchronous.
   */
  function createFromReactiveSource(queryReactiveSource: ReactiveSource<string>): DestroyableSignal<MediaQueryState> {
    const $query = coerceSignal(queryReactiveSource, options);
    let currentQuery = untracked($query);
    const $output = initOutput(currentQuery) as SignalGetter<MediaQueryState> & DestroyableSignal<MediaQueryState>;
    const outputNode = $output[SIGNAL];
    const effectRef = effect(
      () => {
        const nextQuery = $query();
        if (currentQuery !== nextQuery) {
          // because we eagerly run matchMedia, the value of query could be the same and therefore there's no point to run setup again.
          currentQuery = nextQuery;
          onQueryChange(outputNode, currentQuery);
        }
      },
      { ...options, allowSignalWrites: true, manualCleanup: true } // cleanup is handled in onQueryChange, destroy and destroyRef.
    );
    $output.destroy = () => {
      effectRef.destroy(); // make sure the effect is destroyed.
      handleDestroy();
    };
    getDestroyRef(mediaQuerySignal, options?.injector).onDestroy(handleDestroy);
    return $output;
  }

  function createFromValue(query: string): MediaQuerySignal {
    const $output = initOutput(query) as SignalGetter<MediaQueryState> & MediaQuerySignal;
    const outputNode = $output[SIGNAL];
    $output.asReadonly = asReadonlyFnFactory($output);
    $output.destroy = handleDestroy;
    $output.set = (query) => onQueryChange(outputNode, query);
    $output.update = (updateFn) => onQueryChange(outputNode, updateFn(outputNode.value.media));
    if (!options?.manualDestroy) {
      getDestroyRef(mediaQuerySignal, options?.injector).onDestroy(handleDestroy);
    }
    return $output;
  }

  function handleDestroy(): void {
    if (!isDestroyed) {
      isDestroyed = true;
      cleanupFn();
    }
  }

  /**
   * Creates the $output signal and begins listening for media query changes.
   */
  function initOutput(initialQuery: string): SignalGetter<MediaQueryState> {
    const mql = globalThis.matchMedia(initialQuery);
    const $output = createSignal<MediaQueryState>({ matches: mql.matches, media: mql.media }) as SignalGetter<MediaQueryState>;
    updateQueryListener($output[SIGNAL], mql);
    return $output;
  }

  /** Will close the current listener, and listen to the new query if the signal isn't already destroyed. */
  function onQueryChange(outputNode: SignalNode<MediaQueryState>, query: string) {
    if (isDestroyed) {
      return;
    }
    const mql = globalThis.matchMedia(query);
    signalSetFn(outputNode, { matches: mql.matches, media: mql.media });
    updateQueryListener(outputNode, mql);
  }

  /** Lists to a queryList change event, and sets global cleanupFn. */
  function updateQueryListener(outputNode: SignalNode<MediaQueryState>, queryList: MediaQueryList): void {
    // ensure old listener is cleaned up.
    cleanupFn();
    queryList.addEventListener('change', handleMediaQueryListEvent);
    cleanupFn = () => queryList.removeEventListener('change', handleMediaQueryListEvent);
    function handleMediaQueryListEvent(event: MediaQueryListEvent): void {
      signalSetFn(outputNode, { matches: event.matches, media: event.media });
    }
  }
}

function createDummyOutput(query: string): MediaQuerySignal {
  const $output = createSignal<MediaQueryState>({ matches: false, media: query }) as SignalGetter<MediaQueryState> &
    MediaQuerySignal;
  $output.asReadonly = asReadonlyFnFactory($output);
  $output.destroy = () => { /* do nothing */ };
  $output.set = () => { /* do nothing */ };
  $output.update = () => { /* do nothing */ };
  return $output;
}
