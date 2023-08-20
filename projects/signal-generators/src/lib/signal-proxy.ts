/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal } from '@angular/core';

/** The key of a signal that is also a function */
export type SignalFunctionKey<S extends Signal<unknown>, K extends keyof S> =
  keyof S & (S[K] extends (...args: any[]) => any ? K : never);

/** A function of a signal. */
export type SignalFunction<S extends Signal<unknown>, K extends keyof S> =
  S[K] extends (...args: any[]) => any ? S[K] : never;

/** An object that is just the functions on a signal. */
export type SignalFunctions<S extends Signal<unknown>> = {
  [K in keyof S as SignalFunctionKey<S, K>]: S[K]
}

/** A signal-like object that is a copy of it's source signal.  Unlike a signal it is NOT reactive. */
export type SignalProxy<S extends Signal<unknown>> = Signal<ReturnType<S>> & SignalFunctions<S>;

