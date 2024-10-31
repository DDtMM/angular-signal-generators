declare let ngDevMode: object | false;
if (typeof ngDevMode === 'undefined' || !ngDevMode) {
  throw new Error('These tests must be launched in dev mode.  There is no way to manually enable dev mode in tests.');
}
const originalDevMode = ngDevMode;

/**
 * If passed true, simulates being in dev mode by setting ngDevMode to false.
 * Otherwise restores the original ngDevMode value.
 */
export function setProdMode(isDevMode: boolean): void {
  ngDevMode = !isDevMode && originalDevMode;
}
