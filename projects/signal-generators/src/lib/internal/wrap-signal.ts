import { Signal, computed } from '@angular/core';

/**
 * This is used a lot to add a capabilities to a signal and hide its internal operation.
 * Its really usefulness comes if your overwriting existing methods, like set.
 * @deprecated if you know you need this you can just assign the original method to a variable.
 */
export function wrapSignal<T, U extends object>(innerSignal: Signal<T>, addCapabilities: U | ((wrapper: Signal<T>) => U)): Signal<T> & U {
  // it's unfortunate that computed is needed.  If we could just add the SIGNAL symbol, then this could be skipped.
  const wrapper = computed(() => innerSignal());
  const capabilities = typeof addCapabilities === 'function' ? addCapabilities(wrapper) : addCapabilities;
  return Object.assign(wrapper, { ...capabilities });
}
