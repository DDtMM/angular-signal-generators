import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { MockedComponentFixture } from 'ng-mocks';

/** Wraps the signals to call detectChanges after every mutate, set, or update. */
export function autoDetectChangesSignal<T>(fixture: ComponentFixture<unknown>, initialValue: T): WritableSignal<T> {
  const output = signal(initialValue);
  const protoMutateFn = output.mutate;
  const protoSetFn = output.set;
  const protoUpdateFn = output.update;
  Object.assign(output, {
    mutate: (mutatorFn: (value: T) => void) => {
      protoMutateFn.call(output, mutatorFn);
      fixture.detectChanges();
    },
    set: (value: T) => {
      protoSetFn.call(output, value);
      fixture.detectChanges();
    },
    update: (updateFn: (value: T) => T) => {
      protoUpdateFn.call(output, updateFn)
      fixture.detectChanges();
    }
  });
  return output;
}
