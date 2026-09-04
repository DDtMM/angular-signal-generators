import { isDevMode, signal } from '@angular/core';
import { nestSignal } from './nest-signal';
import { setProdMode } from '../../testing/dev-mode-utilities';

describe('nestSignal in production mode', () => {
  afterEach(() => setProdMode(false));

  it('ignores nested errors without writing diagnostics', () => {
    // Angular 20 bundles imports before Vitest can apply module mocks.
    setProdMode(true);
    expect(isDevMode()).toBe(false);
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    const trap = {
      get someValue() {
        throw new Error('someValue will always throw');
      }
    };

    const sut = nestSignal([signal({ trap })], { ignoreErrors: true });
    expect(sut()).toEqual([{ trap: undefined }]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
