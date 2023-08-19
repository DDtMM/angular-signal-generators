/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal } from '@angular/core';

/** A signal-like object that is a copy of it's source signal */
export type SignalProxy<S extends Signal<any>> = ({
  [K in keyof S as S[K] extends (...args: any[]) => any ? K : never]: S[K]
} & (() => ReturnType<S>));

