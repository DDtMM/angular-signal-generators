import { Signal, isSignal } from '@angular/core';
import { isSignalInput } from '../lib/internal/signal-input-utilities';

/** These tests should be run on every signal created. */
export function setupGeneralSignalTests(signalFactory: () => Signal<unknown>): void {
  let signal: Signal<unknown>;

  describe('general signal tests', () => {

    beforeEach(() => signal = signalFactory());

    it('gets a true result when it is passed to isSignal', () => {
      expect(isSignal(signal)).toEqual(true);
    });
    it('gets a true result when it is passed to isSignalInput', () => {
      expect(isSignalInput(signal)).toEqual(true);
    });
  });
}


