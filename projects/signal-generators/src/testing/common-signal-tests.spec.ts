import { Signal, computed, effect, isSignal } from '@angular/core';
import { isSignalInput } from '../lib/internal/signal-input-utilities';
import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { MockRender } from 'ng-mocks';

/**
 * Makes sure a signal properly passes isSignal and isSignalInput.
 * These tests should be run on every signal created.
 */
export function setupTypeGuardTests(signalSetup: () => Signal<unknown>): void {
  describe('when used against type guards', () => {
    it('gets a true result when it is passed to isSignal', () => {
      expect(isSignal(signalSetup())).toEqual(true);
    });
    it('gets a true result when it is passed to isSignalInput', () => {
      expect(isSignalInput(signalSetup())).toEqual(true);
    });
  });
}

/**
 * Tests that the signal being tested works properly with computed and effect.
 * @param setup returns a tuple with the tested signal, and an action that should update the signal.
 * @param fixtureFactory retrieves fixture needed for change detection.  If not provided then one will be created.
 * @param context An optional description.
 */
export function setupComputedAndEffectTests<T>(
  setup: () => [sut: Signal<T>, action: () => void],
  fixtureFactory?: (() => ComponentFixture<unknown>) | null,
  context?: string
): void {
  const expectationContext = context ? `${context}: ` : '';

  it(`${expectationContext}works properly when used within a computed signal`, fakeAsync(() => {
    const [sut, action] = setup();
    const fixture = fixtureFactory?.() ?? MockRender();
    let executionTimesSpy = 0;
    const output = computed(() => {
      executionTimesSpy++;
      return sut();
    });
    fixture.detectChanges(); // no need to worry about async changes since a signal should immediately have an initial value.
    expect(executionTimesSpy).withContext('computed signal does not execute before computed signal is read').toBe(0);
    const initialValue = output();
    expect(executionTimesSpy).withContext('computed signal executes after first read').toBe(1);
    const additionalReadValueBeforeAction = output();
    expect(executionTimesSpy).withContext('computed signal does not execute after additional reads if source has not changed').toBe(1);
    expect(additionalReadValueBeforeAction)
      .withContext('computed signal returns initial value if source has not changed')
      .toBe(initialValue);
    action(); // execute change to signal
    fixture.detectChanges();
    flush();
    fixture.detectChanges(); // make sure to detect any asynchronous changes that occur after flush.
    expect(executionTimesSpy).withContext('when source is updated, computed signal is not immediately updated').toBe(1);
    const updatedValue = output();
    expect(executionTimesSpy).withContext('when source is updated, computed signal is executed when read').toBe(2);
    expect(updatedValue).withContext('when source is updated a new value is returned from computed signal').not.toBe(initialValue);
  }));

  it(`${expectationContext}works properly when used within an effect`, fakeAsync(() => {
    const [sut, action] = setup();
    const fixture = fixtureFactory?.() ?? MockRender();
    let executionTimesSpy = 0;
    const effectRef = effect(
      () => {
        sut();
        executionTimesSpy++;
      },
      { injector: fixture.componentRef.injector }
    );
    fixture.detectChanges(); // no need to worry about async changes since a signal should immediately have an initial value.
    expect(executionTimesSpy).withContext('effect executes immediately after changed detection').toBe(1);
    action(); // execute change to signal
    fixture.detectChanges();
    flush();
    fixture.detectChanges(); // make sure to detect any asynchronous changes that occur after flush.
    expect(executionTimesSpy).withContext('effect executes after signal update is detected').toBe(2);
    effectRef.destroy();
  }));
}
