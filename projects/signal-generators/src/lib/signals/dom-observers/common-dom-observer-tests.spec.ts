import { Signal } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { replaceGlobalProperty } from 'projects/signal-generators/src/testing/testing-utilities';

/**
 * Executes a test that ensures the signal doesn't break if the observer is missing.
 * @param observerName The name of the observer used by the signal.
 * @param signalFn A function that returns the signal.
 * @param actionFn An action that would typically result in a new value to the signal.
 */
export function setupEnsureSignalWorksWhenObserverIsMissing<T>(observerName: string, signalFn: () => Signal<T>, actionFn: () => void) {
  it(`should return an empty signal that doesn't respond to changes if ${observerName} doesn't exist.`, fakeAsync(() => {
    expect(observerName in globalThis).toBeTrue(); // the observer should exist.
    const restoreProperty = replaceGlobalProperty(observerName, undefined);
    const sut = signalFn();
    const initialValue = sut();
    actionFn();
    flush();
    expect(sut()).toEqual(initialValue);
    restoreProperty();
  }));
}
