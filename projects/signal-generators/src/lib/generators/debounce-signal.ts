import { Signal, signal, effect, WritableSignal } from '@angular/core';
import { ComputationOrSignal, toSignal } from '../internal/signal-like';

export function debounceSignal<T>(src: ComputationOrSignal<T>, dueTime: number | ComputationOrSignal<number>): Signal<T | undefined>
export function debounceSignal<T>(src: ComputationOrSignal<T>, dueTime: number | ComputationOrSignal<number>, initialValue: T): Signal<T>
export function debounceSignal<T>(src: ComputationOrSignal<T>, dueTime: number | ComputationOrSignal<number>, initialValue?: T): Signal<T | typeof initialValue> {
  const output = signal<T | typeof initialValue>(initialValue);
  const srcSignal = toSignal(src);
  if (typeof dueTime === 'number') {
    debounceSignalNumberDueTime(srcSignal, dueTime, output);
  }
  else {
    debounceSignalComputationOrSignalDueTime(srcSignal, dueTime, output);
  }
  return output;
}

function debounceSignalNumberDueTime<T>(src: Signal<T>, dueTime: number, output: WritableSignal<T>): void {
  effect((onCleanup) => {
    const value = src();
    const timeoutId = setTimeout(() => output.set(value), dueTime);
    onCleanup(() => clearTimeout(timeoutId));
  });
}

function debounceSignalComputationOrSignalDueTime<T>(src: Signal<T>, dueTime: ComputationOrSignal<number>, output: WritableSignal<T>): void {
  const dueTimeSignal = toSignal(dueTime);
  effect((onCleanup) => {
    const value = src();
    const timeoutId = setTimeout(() => output.set(value), dueTimeSignal());
    onCleanup(() => clearTimeout(timeoutId));
  });
}

