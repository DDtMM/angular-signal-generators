import { effect, Injector, isDevMode } from '@angular/core';
import { nestSignal, NestSignalOptions, NestSignalValue } from '../signals/nest-signal';

/**
 * Options that control the behavior of {@link inspect}.
 * Options specific to inspect can be set globally from {@link INSPECT_DEFAULTS}.
 */
export interface InspectOptions<T> extends NestSignalOptions<T> {
  /** Needed if not created in an injection context. */
  injector?: Injector;
  /** Overrides the default reporter.*/
  reporter?: (value: NestSignalValue<T>) => void;
  /** By default inspect will only work in dev mode.  Set to true to run in prod mode. */
  runInProdMode?: boolean;
  /**
   * If true, then the first output is not reported.
   * This is dependent on one when the first effect actually executes.
   */
  skipInitial?: boolean;
}

/**
 * Given that {@link inspect} should have no side-effects and does nothing in production mode,
 * this is provided as a simple way to set the default behavior without having to get into dependency injection.
 * You can modify this from wherever you want.
 */
export const INSPECT_DEFAULTS = {
  /** This is the default reporter for inspect. */
  reporter: (value: unknown) => console.log(value),
  /** If true, this will run even if in prod mode is enabled. */
  runInProdMode: false,
  /** If true, the initial value will not be reported. */
  skipInitial: false
}

/**
 * Reports the latest state of a subject by resolving all the values deeply contained within by using {@link nestSignal}.
 * By default the output is just a console.log, but this can be changed with the {@link InspectOptions<T>.reporter} option.
 * Subject can be anything, but to be effective it should be a signal, an object that contains signals, or an array of signals.
 * @param subject This can be anything, but ideally it is some object that contains signals somewhere.
 * @param options Options that control the behavior of inspect.  Globally, options can be changed from {@link INSPECT_DEFAULTS}.
 * @example
 * ```ts
 * const $a = signal(1);
 * const $b = signal(2);
 * const $c = signal({ a: $a, b: $b });
 * inspect([$c]); // log: [{ a: 1, b: 2 }];
 * $b.set(3) // log: [{ a: 1, b: 3 }];
 * ```
*/
export function inspect<T>(subject: T, options?: InspectOptions<T>): void {
  if (!isDevMode() && !(options?.runInProdMode ?? INSPECT_DEFAULTS.runInProdMode)) {
    return;
  }
  let reporter = options?.reporter ?? INSPECT_DEFAULTS.reporter;
  if (options?.skipInitial ?? INSPECT_DEFAULTS.skipInitial) {
    const nextReporter = reporter;
    reporter = () => reporter = nextReporter;
  }
  const $input = nestSignal(subject, options);
  effect(() => reporter($input()), { ...options });
}
