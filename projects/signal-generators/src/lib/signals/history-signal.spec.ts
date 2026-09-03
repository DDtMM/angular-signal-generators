import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { runComputedAndEffectTests, runDebugNameOptionTest, runDoesNotCauseReevaluationsSimplyWhenNested, runInjectorOptionTest, runTypeGuardTests } from '../../testing/common-signal-tests';
import { historySignal } from './history-signal';

describe('historySignal', () => {
  describe('when created with a signal', () => {
    runDebugNameOptionTest((debugName) => TestBed.runInInjectionContext(() => historySignal(signal(1), { debugName })));
    runInjectorOptionTest((injector) => historySignal(signal(1), { injector }));
    runTypeGuardTests(() => TestBed.runInInjectionContext(() => historySignal(signal(1))));
    runComputedAndEffectTests(() => {
      const source = signal(1);
      return [TestBed.runInInjectionContext(() => historySignal(source)), () => source.set(2)];
    });

    it('records source changes for undo and redo', () => {
      const source = signal(1);
      const sut = TestBed.runInInjectionContext(() => historySignal(source));
      TestBed.tick();
      source.set(2);
      TestBed.tick();
      source.set(3);
      TestBed.tick();
      expect(sut()).toBe(3);
      expect(sut.undo()).toBeTrue();
      expect(sut()).toBe(2);
      expect(sut.redo()).toBeTrue();
      expect(sut()).toBe(3);
    });

    it('may skip simultaneous source emissions', () => {
      const source = signal(0);
      const sut = TestBed.runInInjectionContext(() => historySignal(source));
      TestBed.tick();
      source.set(1);
      source.set(2);
      TestBed.tick();
      expect(sut()).toBe(2);
      sut.undo();
      expect(sut()).toBe(0);
    });
  });

  describe('when created from a value', () => {
  runDebugNameOptionTest((debugName) => historySignal(1, { debugName }));
  runTypeGuardTests(() => historySignal(1));
  runComputedAndEffectTests(() => {
    const sut = historySignal(1);
    return [sut, () => sut.set(2)];
  });
  runDoesNotCauseReevaluationsSimplyWhenNested(
    () => historySignal(1),
    (sut) => sut.set(2)
  );

  it('initially returns the initial value with no history', () => {
    const sut = historySignal(1);
    expect(sut()).toBe(1);
    expect(sut.canUndo()).toBeFalse();
    expect(sut.canRedo()).toBeFalse();
  });

  it('undoes and redoes set values', () => {
    const sut = historySignal(1);
    sut.set(2);
    sut.set(3);
    expect(sut.undo()).toBeTrue();
    expect(sut()).toBe(2);
    expect(sut.undo()).toBeTrue();
    expect(sut()).toBe(1);
    expect(sut.undo()).toBeFalse();
    expect(sut.redo()).toBeTrue();
    expect(sut()).toBe(2);
  });

  it('records update values', () => {
    const sut = historySignal(2);
    sut.update(value => value * 3);
    expect(sut()).toBe(6);
    sut.undo();
    expect(sut()).toBe(2);
  });

  it('clears redo history when a new value is set', () => {
    const sut = historySignal(1);
    sut.set(2);
    sut.undo();
    sut.set(3);
    expect(sut.canRedo()).toBeFalse();
    expect(sut.redo()).toBeFalse();
  });

  it('limits retained history', () => {
    const sut = historySignal(0, { limit: 2 });
    sut.set(1);
    sut.set(2);
    sut.set(3);
    sut.undo();
    sut.undo();
    expect(sut()).toBe(1);
    expect(sut.undo()).toBeFalse();
  });

  it('restores all retained values after reaching the history limit', () => {
    const sut = historySignal(0, { limit: 2 });
    sut.set(1);
    sut.set(2);
    sut.set(3);
    sut.undo();
    sut.undo();

    expect(sut.redo()).toBeTrue();
    expect(sut()).toBe(2);
    expect(sut.redo()).toBeTrue();
    expect(sut()).toBe(3);
    expect(sut.redo()).toBeFalse();

    sut.undo();
    sut.undo();
    expect(sut()).toBe(1);
    expect(sut.undo()).toBeFalse();
  });

  it('does not record equal values', () => {
    const sut = historySignal(2, { equal: (a, b) => a % 2 === b % 2 });
    sut.set(4);
    expect(sut()).toBe(2);
    expect(sut.canUndo()).toBeFalse();
    sut.set(3);
    expect(sut.canUndo()).toBeTrue();
  });

  it('supports undefined values in history', () => {
    const sut = historySignal<number | undefined>(undefined);
    sut.set(1);
    expect(sut.undo()).toBeTrue();
    expect(sut()).toBeUndefined();
  });

  it('clears history without changing the current value', () => {
    const sut = historySignal(1);
    sut.set(2);
    sut.clearHistory();
    expect(sut()).toBe(2);
    expect(sut.canUndo()).toBeFalse();
    expect(sut.canRedo()).toBeFalse();
  });

  it('rejects invalid limits', () => {
    expect(() => historySignal(1, { limit: -1 })).toThrowError();
    expect(() => historySignal(1, { limit: 1.5 })).toThrowError();
  });

  it('#asReadonly returns a signal that reflects the original', () => {
    const sut = historySignal(1);
    const readonly = sut.asReadonly();
    sut.set(2);
    expect(readonly()).toBe(2);
  });
  });
});
