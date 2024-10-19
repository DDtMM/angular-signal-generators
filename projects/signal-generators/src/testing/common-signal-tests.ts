import { ChangeDetectionStrategy, Component, Injector, Signal, inject, isSignal, runInInjectionContext, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { isReactive } from '../lib/internal/reactive-source-utilities';
import { computedSpy, effectSpy } from './signal-testing-utilities';

/**
 * Makes sure a signal properly passes isSignal and isSignalInput.
 * These tests should be run on every signal created.
 */
export function setupTypeGuardTests(signalSetup: () => Signal<unknown>): void {
  describe('when used against type guards', () => {
    it('gets a true result when it is passed to isSignal', () => {
      expect(isSignal(TestBed.runInInjectionContext(() => signalSetup()))).toEqual(true);
    });
    it('gets a true result when it is passed to isSignalInput', () => {
      expect(isReactive(TestBed.runInInjectionContext(() => signalSetup()))).toEqual(true);
    });
  });
}

/**
 * If the signal is created in a *computed* of *effect* then it shouldn't cause any extra evaluations.
 * This would detect if a change from the update function causes the computed to refire.
 * NOTE: This will throw on signals relying on effects!!! (Is this actually true?)
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
      @Component({
        template: '<div>{{computedSignal()}}</div>',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class TestComponent {
        private readonly injector = inject(Injector);
        readonly dummySignal = signal(1);
        readonly computedSignal = computedSpy(() => ({
          dummyVal: this.dummySignal(),
          sut: runInInjectionContext(this.injector, signalSetup)
        }));
        readonly effectRef = effectSpy(() => runInInjectionContext(this.injector, signalSetup))
      }
      const fixture =  MockRender(TestComponent);
      const computedSignal = fixture.point.componentInstance.computedSignal;
      const effectRef = fixture.componentInstance.effectRef;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(computedSignal.timesUpdated).withContext('computed signal with instantiated target does not execute unnecessarily').toBe(1);
      expect(effectRef.timesUpdated).withContext('effect with instantiated target does not execute unnecessarily').toBe(1);
      signalUpdateFn(computedSignal().sut, fixture);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(computedSignal.timesUpdated).withContext('change to the target signal does not cause computed signal to update').toBe(1);
      expect(effectRef.timesUpdated).withContext('change to the target signal does not cause effect to execute').toBe(1);
      fixture.point.componentInstance.dummySignal.set(5);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(computedSignal.timesUpdated).withContext('the expected number of changes occur after a signal used in computed is updated.').toBe(2);
      expect(effectRef.timesUpdated).withContext('effect never executes more than once.').toBe(1);
    }));
  });
}

/**
 * Tests that the signal being tested works properly with computed and effect.
 * @param setup returns a tuple with the tested signal, and an action that should update the signal.
 * @param context An optional description.
 * @param fixtureFactory An optional fixture in case rendering already occurred.
 * @param useRealAsync Tests will use fakeAsync (which is faster) unless this is true.
 */
export function setupComputedAndEffectTests<T>(
  setup: () => [sut: Signal<T>, action: () => unknown | Promise<unknown>],
  context?: string,
  fixtureFactory?: () => MockedComponentFixture<unknown, unknown>
): void {
  const expectationContext = context ? `${context}: ` : '';

  it(`${expectationContext}works properly when used within a computed signal`, fakeAsync(() => {
    const fixture = fixtureFactory?.() ?? MockRender();
    const [$sut, action] = runInInjectionContext(fixture.componentRef.injector, setup);
    const $computedSut = computedSpy(() => $sut());
    expect($computedSut.timesUpdated).withContext('computed signal does not execute before computed signal is read').toBe(0);
    const initialValue = $computedSut();
    expect($computedSut.timesUpdated).withContext('computed signal executes after first read').toBe(1);
    const additionalReadValueBeforeAction = $computedSut();
    expect($computedSut.timesUpdated).withContext('computed signal does not execute after additional reads if source has not changed').toBe(1);
    expect(additionalReadValueBeforeAction)
      .withContext('computed signal returns initial value if source has not changed')
      .toBe(initialValue);
    action(); // execute change to signal
    // while computed does not need detectChanges, a signal that relies on effects might.
    fixture.detectChanges();
    flush();
    fixture.detectChanges(); // make sure to detect any asynchronous changes that occur after flush.
    expect($computedSut.timesUpdated).withContext('when source is updated, computed signal is not immediately updated').toBe(1);
    const updatedValue = $computedSut();
    expect($computedSut.timesUpdated).withContext('when source is updated, computed signal is executed when read').toBe(2);
    expect(updatedValue).withContext('when source is updated a new value is returned from computed signal').not.toBe(initialValue);
  }));

  it(`${expectationContext}works properly when used within an effect`, fakeAsync(() => {
    const fixture = fixtureFactory?.() ?? MockRender();
    const [$sut, action] = runInInjectionContext(fixture.componentRef.injector, setup);
    const effectRef = effectSpy(() => $sut(), { injector: fixture.componentRef.injector });
    fixture.detectChanges(); // no need to worry about async changes since a signal should immediately have an initial value.
    expect(effectRef.timesUpdated).withContext('effect executes immediately after changed detection').toBe(1);
    action(); // execute change to signal
    fixture.detectChanges();
    flush();
    fixture.detectChanges(); // make sure to detect any asynchronous changes that occur after flush.
    // This test originally was just checking that the effect was called twice.
    // However, when upgrading to 17.2 it appears that async functions like timers would could effects to trigger.
    expect(effectRef.timesUpdated).withContext('effect executes after signal update is detected').toBeGreaterThanOrEqual(2);
    effectRef.destroy();
  }));

}


