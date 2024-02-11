import { ChangeDetectionStrategy, Component, Signal, computed, effect, isSignal, signal } from '@angular/core';
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
 * If the signal is created in a *computed* of *effect* then it shouldn't cause any extra evaluations.
 * This would detect if a change from the update function causes the computed to refire.
 * NOTE: This will throw on signals relying on effects!!!
 * NOTE2: I'm not sure if effect tests are actually effective, but computed definitely are.
 * @param signalSetup a function that will just create a signal
 * @param signalUpdateFn a function that will update a signal
 */
export function setupDoesNotCauseReevaluationsSimplyWhenNested<T, S extends Signal<T>>(
  signalSetup: () => S,
  signalUpdateFn: (sut: S, fixture: ComponentFixture<unknown>) => void,
): void {
  describe('when created inside an computed', () => {
    it('does not cause multiple evaluations', fakeAsync(() => {
      let computedExecutionTimesSpy = 0;
      let effectExecutionTimesSpy = 0;
      let createdSignal: S;
      @Component({
        template: '<div>{{computedSignal()}}</div>',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class TestComponent {
        dummySignal = signal(1);
        computedSignal = computed(
          () => {
            createdSignal = signalSetup();
            computedExecutionTimesSpy++;
            return this.dummySignal();
          },
          { equal: () => false }
        );
        _ = effect(() => {
          signalSetup();
          effectExecutionTimesSpy++;
        })
      }
      const fixture =  MockRender(TestComponent);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(computedExecutionTimesSpy).withContext('computed signal with instantiated target does not execute unnecessarily').toBe(1);
      expect(effectExecutionTimesSpy).withContext('effect with instantiated target does not execute unnecessarily').toBe(1);
      signalUpdateFn(createdSignal!, fixture);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(computedExecutionTimesSpy).withContext('change to the target signal does not cause computed signal to update').toBe(1);
      expect(effectExecutionTimesSpy).withContext('change to the target signal does not cause effect to execute').toBe(1);
      fixture.point.componentInstance.dummySignal.set(5);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(computedExecutionTimesSpy).withContext('the expected number of changes occur after a signal used in computed is updated.').toBe(2);
      expect(effectExecutionTimesSpy).withContext('effect never executes more than once.').toBe(1);
    }));
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
