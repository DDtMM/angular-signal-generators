import { CreateComputedOptions, CreateEffectOptions, EffectCleanupFn, EffectRef, Signal, computed, effect } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';


/**
 * Wraps a signal with a Proxy that calls change detection after each method call.
 * Does not initially call detectChanges when created - this would have an impact on signals that depend on effects.
 * Don't know if this a good idea or not.
*/
export function autoDetectChangesSignal<T, S extends Signal<T>>(fixture: ComponentFixture<unknown>, $source: S): S {

  const proxy = new Proxy($source, {
    get(target, propName: string | symbol, receiver) {
      const propVal = Reflect.get(target, propName, receiver);
      if (typeof propVal === 'function') {
        return new Proxy(propVal, {
          apply: (targetInner, thisArg, argumentsList) => {
            const res = Reflect.apply(targetInner, thisArg, argumentsList);
            // At some point this can be changed to TestBed.flushEffects() once we stop supporting Angular 16.
            // Actually is TestBed.flushEffects enough?
            fixture.detectChanges();
            return res;
          }
        });
      }
      return propVal;
    }
  });

  return proxy;
}

export type ComputedSpy<T> = Signal<T> & {
  /** The number of times the computation function has been executed. */
  timesUpdated: number
};

/** Creates a computed signal that monitors the number of times it is updated. */
export function computedSpy<T>(computation: () => T, options?: CreateComputedOptions<T>): ComputedSpy<T> {
  let timesUpdated = 0;
  const output = computed(() => {
    timesUpdated++;
    return computation();
  }, options);
  Object.defineProperty(output, 'timesUpdated', { get: () => timesUpdated });
  return output as ComputedSpy<T>;
}

export type EffectSpy = EffectRef & {
  /** The number of times the effectFn function has been executed. */
  timesUpdated: number
};

/** Creates a computed signal that monitors the number of times it is updated. */
export function effectSpy(effectFn: (onCleanup: (cleanupFn: EffectCleanupFn) => void) => void, options?: CreateEffectOptions): EffectSpy {
  let timesUpdated = 0;
  const output = effect((onCleanup) => {
    timesUpdated++;
    return effectFn(onCleanup);
  }, options);
  Object.defineProperty(output, 'timesUpdated', { get: () => timesUpdated });
  return output as EffectSpy;
}
