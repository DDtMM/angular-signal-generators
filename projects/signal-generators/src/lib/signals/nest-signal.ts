import { computed, CreateSignalOptions, Injector, isSignal, Signal } from '@angular/core';
import { createSignal, SIGNAL, signalSetFn, signalUpdateFn } from '@angular/core/primitives/signals';
import { isReactive } from '../internal/reactive-source-utilities';
import { coerceSignal } from '../internal/signal-coercion';
import { TransformedSignal } from '../internal/transformed-signal';
import { asReadonlyFnFactory } from '../internal/utilities';
import { ReactiveSource } from '../reactive-source';
import { ValueSource } from '../value-source';

/** Options for {@link nestSignal}. */
export interface NestSignalOptions<T> extends CreateSignalOptions<NestSignalValue<T>> {
  /** Needed if not created in injection context and an Subscribable is passed as source. */
  injector?: Injector;
}

/** The value returned by {@link nestSignal} that recursively replaces signals with their value types.  */
export type NestSignalValue<T> = T extends Signal<infer R>
  ? NestSignalValue<R>
  : T extends []
  ? NestSignalValue<T[number]>[]
  : // Begin built in types where we want to control traversal.
  T extends Set<infer R>
  ? Iterable<NestSignalValue<R>> // currently this is just an array, but in the future it could be something else.
  : T extends Map<infer K, infer V>
  ? Iterable<NestSignalValue<K>, NestSignalValue<V>> // currently this is just an array, but in the future it could be something else.
  : T extends Date
  ? T
  : // Objects should be traversed, and remaining non-object types should be returned as-is.
  T extends object
  ? { [K in keyof T]: NestSignalValue<T[K]> }
  : T;

export function nestSignal<T>(source: ReactiveSource<T>, options?: NestSignalOptions<T>): Signal<NestSignalValue<T>>;
export function nestSignal<T>(initialValue: T, options?: NestSignalOptions<T>): TransformedSignal<T, NestSignalValue<T>>;
/**
 * Creates a signal whose value may have several, deeply nested signals.
 * Any time any of the nested signals are updated, the signal will be updated as well.
 * The returned value from the signal will be all of the resolved values from the nested signals.
 * @param source The nest object that contains signals.
 * @param options Options that effect the behavior of the signal.
 * @example
 * ```ts
 * const $count = signal(0);
 * const $text = signal('hello');
 * const $why = signal({ count: computed(() => $count() + 1), text: [$text] })
 * const $nested = nestSignal({ count: $count, text: $text, why: $why });
 * console.log($nested()); // [LOG]: { count: 0, text: 'hello', why: { count: 1, text: ['hello'] } }
 * $count.set(1);
 * console.log($nested()); // [LOG]: { count: 1, text: 'hello', why: { count: 2, text: ['hello'] } }
 * ```
 */
export function nestSignal<T>(
  source: ValueSource<T>,
  options?: NestSignalOptions<T>
): Signal<NestSignalValue<T>> | TransformedSignal<T, NestSignalValue<T>> {


  return isReactive(source) ? createFromReactiveSource(source, options) : createFromValue(source, options);

  function createFromReactiveSource<T>(
    reactiveSource: ReactiveSource<T>,
    options?: NestSignalOptions<T>
  ): Signal<NestSignalValue<T>> {
    const $input = coerceSignal(reactiveSource, options);
    return computed(() => deNestRoot($input()), options);
  }
  
  function createFromValue<T>(initialValue: T, options?: NestSignalOptions<T>): TransformedSignal<T, NestSignalValue<T>> {
    const $source = createSignal(initialValue);
    const sourceNode = $source[SIGNAL];
    const $unwrapped = computed(() => deNestRoot($source()), options) as TransformedSignal<T, NestSignalValue<T>>;
    $unwrapped.asReadonly = asReadonlyFnFactory($unwrapped);
    $unwrapped.set = (value: T) => signalSetFn(sourceNode, value);
    $unwrapped.update = (updateFn: (value: T) => T) => signalUpdateFn(sourceNode, updateFn);
    return $unwrapped;
  }

  function deNestRoot<T>(input: T): NestSignalValue<T> {
    /** To prevent infinite loops, the results of denesting objects are cached. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nestCache = new WeakMap<any, unknown>();
    const stack: [input: unknown, output: unknown][] = [];
    return deNest(input) as NestSignalValue<T> ;

    function deNest<T>(input: T): unknown {
      const stackEntryOutput = stack.find(([stackInput]) => stackInput === input)?.[1];
      if (stackEntryOutput) {
        // to prevent recursion, we need to return the output if the input was found in the stack.
        return stackEntryOutput;
      }
      else if (isSignal(input)) {
        return getOrSetInCache(input, () => deNest(input()));
      } else if (Array.isArray(input)) {
        return getOrSetInCache(input, () => {
          const output: unknown[] = [];
          stack.push([input, output]);
          input.forEach(x => output.push(deNest(x)));
          stack.pop();
          return output;
        });
      } else if (input instanceof Set) {
        return getOrSetInCache(input, () => {
          const output: unknown[] = [];
          stack.push([input, output]);
          input.forEach((value) => output.push(deNest(value)));
          stack.pop();
          return output;  
        });
      } else if (input instanceof Map) {
        return getOrSetInCache(input, () => {
          const output: [unknown, unknown][] = [];
          stack.push([input, output]);
          input.forEach((value, key) => output.push([deNest(key), deNest(value)]));
          stack.pop();
          return output;
        });
      } else if (input instanceof Date) {
        return input as NestSignalValue<T>;
      } else if (typeof input === 'object' && input !== null) {
        return getOrSetInCache(input, () => {
          const output: Record<string, unknown> = {};
          stack.push([input, output]);
          Object.entries(input).forEach(([key, value]) => output[key] = deNest(value));
          stack.pop();  
          return output;
        });
      } else {
        return input;
      }
    }

    function getOrSetInCache<T>(input: T, resolver: () => unknown): unknown {
      if (nestCache.has(input)) {
        return nestCache.get(input);
      } else {
        const value = resolver();
        nestCache.set(input, value);
        return value;
      }
    }
  }
}
