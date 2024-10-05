import { Signal } from '@angular/core';

/**
 * A signal that can be destroyed, releasing underlying resources and preventing future emissions.
 * If created in an injector context, then it should be destroyed automatically, and calling {@link destroy}
 * is only if for cases when it is desirable to stop future emissions early.
 * For signals created outside an injector context, this is the only way to clean up resources such as event listeners.
 */
export interface DestroyableSignal<T> extends Signal<T> {
  /**
   * This signal relies on resources that must be cleaned up.
   * If it was created in an injector context then this doesn't have to be called, but is safe to call early.
   * if it was created outside of an injector context then this should be called when it is no longer needed.
   */
  destroy(): void;
}
