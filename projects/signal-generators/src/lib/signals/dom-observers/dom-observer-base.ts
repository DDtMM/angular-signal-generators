import { effect, ElementRef, Injector, Signal, untracked } from '@angular/core';
import { createSignal, SIGNAL, SignalGetter } from '@angular/core/primitives/signals';
import { isReactive } from '../../internal/reactive-source-utilities';
import { coerceSignal } from '../../internal/signal-coercion';
import { asReadonlyFnFactory, getDestroyRef, setDebugNameOnNode } from '../../internal/utilities';
import { ReactiveSource } from '../../reactive-source';
import { ValueSource } from '../../value-source';


export type DomObserver = IntersectionObserver | MutationObserver | ResizeObserver;

export type DomObserverObserverFn<D extends DomObserver> = D['observe'];
export type DomObserverTarget<D extends DomObserver> = Parameters<DomObserverObserverFn<D>>[0];
export type DomObserverOptions<D extends DomObserver> = Parameters<DomObserverObserverFn<D>>[1];
export type DomObserverCallback<D extends DomObserver> =
  D extends IntersectionObserver ? IntersectionObserverCallback
  : D extends MutationObserver ? MutationCallback
  : D extends ResizeObserver ? ResizeObserverCallback
  : never;

export type DomObserverOutput<D extends DomObserver> = Parameters<DomObserverCallback<D>>[0] & unknown[];
export type DomSignalValue<D extends DomObserver> = ElementRef | null | undefined | DomObserverTarget<D>;


export type DomObserverSignal<D extends DomObserver, I extends DomSignalValue<D>> = Signal<DomObserverOutput<D>> & {
  /** Returns the output signal as a readonly. */
  asReadonly(): Signal<DomObserverOutput<D>>;
  /** Sets the new value to observe.  Settings options isn't supported in intersection observers. */
  set(value: I, options?: DomObserverOptions<D>): void;
  /** Begins observing new value with function that derives value from the original. */
  update(updateFn: (value: I) => I): void;
}


/**
 *
 * @param observerFactoryFn Returns an observer that executes a callback whenever a notification is received.
 * @param source The Observed value.
 * @param options A mixture of options for the signal and the observer.
 * @param nativeObservedTransformFn Converts the source value into the appropriate type for the observer.
 * @param initialOutput The initial output for the signal.
 * @param injector The injector used to create an effect to monitor changes to the source if it is a signal.
 * @returns A signal whose value changes to the latest observer output.
 */
export function domObserverSignalFactory<D extends DomObserver, I extends DomSignalValue<D>, T extends DomObserverTarget<D>>(
  observerFactoryFn: (callback: (result: DomObserverOutput<D>) => void) => D,
  source: ValueSource<I>,
  options: DomObserverOptions<D>,
  nativeObservedTransformFn: (rawSubject: I) => T | undefined,
  debugName: string | undefined,
  injector: Injector
): DomObserverSignal<D, I> | Signal<DomObserverOutput<D>> {
  const [get, set] = createSignal<DomObserverOutput<D>>([]);
  setDebugNameOnNode(get[SIGNAL], debugName);

  const observer = observerFactoryFn(set);
  const destroyRef = getDestroyRef(domObserverSignalFactory, injector);
  destroyRef.onDestroy(() => observer.disconnect());

  if (isReactive(source)) {
    domObserverComputedSignalSetup(observer, source, options, nativeObservedTransformFn, injector);
    return get;
  }
  else {
    return domObserverWritableSignalFactory(observer, get, source, options, nativeObservedTransformFn);
  }
}

/**
 * Creates a writable signal.
 * @param observer The observer that watches subjects.
 * @param $output The signal function to add methods to.  This will be mutated directly.
 * @param initialSubject The initially watched subject.
 * @param options A mixture of options for the signal and the observer.
*/
function domObserverWritableSignalFactory<D extends DomObserver, I extends DomSignalValue<D>, S extends DomObserverTarget<D>>(
  observer: D,
  $output: SignalGetter<DomObserverOutput<D>> & Partial<DomObserverSignal<D, I>>,
  initialSubject: I,
  options: DomObserverOptions<D>,
  nativeObservedTransformFn: (rawSubject: I) => S | undefined,
): DomObserverSignal<D, I> {
  let untransformedSubject = initialSubject;
  observeNextSubject(observer, nativeObservedTransformFn(initialSubject), options);

  $output.asReadonly = asReadonlyFnFactory($output);
  $output.set = updateState;
  $output.update = (updateFn: (value: I) => I) => updateState(updateFn(untransformedSubject))
  return $output as DomObserverSignal<D, I>;

  function updateState(nextSubject: I, nextOptions?: DomObserverOptions<D>): void {
    if (nextSubject !== untransformedSubject || nextOptions !== undefined) {
      untransformedSubject = nextSubject;
      options = nextOptions ?? options;
      observeNextSubject(observer, nativeObservedTransformFn(nextSubject), options);
    }
  }
}

/** Sets up watching changes to the source signal and routes it to the observer. */
function domObserverComputedSignalSetup<D extends DomObserver, I extends DomSignalValue<D>, S extends DomObserverTarget<D>>(
  observer: D,
  subjectSource: ReactiveSource<I>,
  options: DomObserverOptions<D>,
  nativeObservedTransformFn: (element: I) => S | undefined,
  injector: Injector
): void {
  const $subject = coerceSignal(subjectSource, { injector }) as SignalGetter<I>;
  const subjectNode = $subject[SIGNAL];
  let currentSubject: undefined | I;
  if (!subjectNode.producerMustRecompute(subjectNode)) {
    // only start observing immediately IF the signal value is updated.  Otherwise wait for the effect.
    currentSubject = untracked($subject);
    observeNextSubject<D, S>(observer, nativeObservedTransformFn(currentSubject), options);
  }
  effect(() => {
    const nextSubject = $subject();
    if (nextSubject !== currentSubject) {
      // only update the observer if the subject has Changed.
      currentSubject = nextSubject;
      observeNextSubject(observer, nativeObservedTransformFn(nextSubject), options);
    }
  }, { injector });
}

/** Common behavior when the subject changes. */
function observeNextSubject<D extends DomObserver, S extends DomObserverTarget<D>>(
  observer: DomObserver, subject: S | undefined, options: DomObserverOptions<D>): void {
  observer.disconnect();
  if (subject !== undefined) {
    // The types are a intersection of all possible targets which is not possible.
    // Also IntersectionObserver doesn't support options changing.
    (observer.observe as (subject: S, options?: DomObserverOptions<D>) => void)(subject, options);
  }
}
