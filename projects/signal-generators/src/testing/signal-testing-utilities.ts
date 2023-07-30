import { Signal, WritableSignal, isSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

type PartialWritableSignal<T> = Signal<T> & Partial<WritableSignal<T>>;

/** Wraps the signals to call detectChanges after every mutate, set, or update. */
export function autoDetectChangesSignal<T, U extends PartialWritableSignal<T>>(fixture: ComponentFixture<unknown>, signal: U): U
export function autoDetectChangesSignal<T>(fixture: ComponentFixture<unknown>, initialValue: T): WritableSignal<T>
export function autoDetectChangesSignal<T>(fixture: ComponentFixture<unknown>, initialValue: T | PartialWritableSignal<T>): PartialWritableSignal<T> {
  const output = isPartialWritableSignal(initialValue) ? initialValue : signal(initialValue);
  const { mutate: originalMutate, set: originalSet, update: originalUpdate } = output;

  Object.assign(output, {
    mutate: originalMutate ? addDetectChangesToFunction(originalMutate) : undefined,
    set: originalSet ? addDetectChangesToFunction(originalSet) : undefined,
    update: originalUpdate ? addDetectChangesToFunction(originalUpdate) : undefined
  });
  return output;

  /** This will wrap autoDetectChanges after the function call. */
  function addDetectChangesToFunction <TArgs extends unknown[], TOut>(fn: (...args: TArgs) => TOut) {
    return (...args: TArgs) => {
      fn.apply(output, args);
      fixture.detectChanges();
    }
  }

  function isPartialWritableSignal<T>(value: T | PartialWritableSignal<T>): value is PartialWritableSignal<T> {
    return isSignal(value) && ('mutate' in value || 'set' in value || 'update' in value);
  }
}

