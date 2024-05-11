import { Signal } from '@angular/core';
import { replaceGlobalProperty } from 'projects/signal-generators/src/testing/testing-utilities';

/** Observer tests have to be asynchronous and need to give the browser time to process. */
const OBSERVER_DELAY = 250;

/**
 * Delays for a preset amount of type.
 *
 * @example
 * ``` ts
 * await delayForObserver();
 * ```
 */
export function delayForObserver(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, OBSERVER_DELAY));
}




/**
 * Executes a test that ensures the signal doesn't break if the observer is missing.
 * @param observerName The name of the observer used by the signal.
 * @param signalFn A function that returns the signal.
 * @param actionFn An action that would typically result in a new value to the signal.
 */
export function setupEnsureSignalWorksWhenObserverIsMissing<T>(observerName: string, signalFn: () => Signal<T>, actionFn: () => void) {
  it(`should return an empty signal that doesn\'t respond to changes if ${observerName} doesn\'t exist.`, async () => {
    expect(observerName in globalThis).toBeTrue(); // the observer should exist.
    const restoreProperty = replaceGlobalProperty(observerName, undefined);
    const sut = signalFn();
    const initialValue = sut();
    actionFn();
    await delayForObserver();
    expect(sut()).toEqual(initialValue);
    restoreProperty();
  });
}
