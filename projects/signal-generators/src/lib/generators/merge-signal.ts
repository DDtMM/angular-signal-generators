import { CreateSignalOptions, Signal, computed } from "@angular/core";
import { refSignal } from "../internal/ref-signal";

export interface MergeSignalOptions<T> extends CreateSignalOptions<T> {
  initialValue?: T;
}
export function mergeSignal<T, U>(a: Signal<T>, b: Signal<U>): Signal<T | U | undefined>
export function mergeSignal<T, U>(a: Signal<T>, b: Signal<U>, options: MergeSignalOptions<T | U>): Signal<T | U>
export function mergeSignal<T, U>(a: Signal<T>, b: Signal<U>, options?: MergeSignalOptions<T | U>): Signal<T | U | undefined> {
  let initialReturned = false;
  let initialValue = options?.initialValue;

  const aRef = refSignal(a);
  // keep a reference to A.  If it changed then that's what is returned otherwise, b must have changed.
  let aPrior = aRef();
  return computed(() => {
    const aCur = aRef();
    const bCur = b();
    if (!initialReturned) {
      initialReturned = true;
      return initialValue;
    }
    if (aPrior !== aCur) {
      aPrior = aCur;
      return aCur.ref;
    }
    // since a didn't change, then it must be b b.
    return bCur;
  });
}
