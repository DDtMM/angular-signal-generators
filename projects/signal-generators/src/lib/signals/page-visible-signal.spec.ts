import { TestBed } from '@angular/core/testing';
import {
  runComputedAndEffectTests,
  runDebugNameOptionTest,
  runDoesNotCauseReevaluationsSimplyWhenNested,
  runInjectorOptionTest,
  runTypeGuardTests
} from '../../testing/common-signal-tests';
import { computedSpy } from '../../testing/signal-testing-utilities';
import { createFixture, replaceGlobalProperty } from '../../testing/testing-utilities';
import { pageVisibleSignal } from './page-visible-signal';

describe('pageVisibleSignal', () => {
  let visibilityState: DocumentVisibilityState | undefined;
  beforeEach(() => {
    visibilityState = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibilityState as DocumentVisibilityState);
  });

  runTypeGuardTests(() => pageVisibleSignal());
  runDebugNameOptionTest((debugName) => pageVisibleSignal({ debugName }));
  runInjectorOptionTest((injector) => pageVisibleSignal({ injector }));
  runComputedAndEffectTests(() => [pageVisibleSignal(), () => changeVisibility('hidden')]);
  runDoesNotCauseReevaluationsSimplyWhenNested(
    () => pageVisibleSignal(),
    () => changeVisibility('hidden')
  );

  it('should immediately return true when the page is visible', () => {
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    expect(sut()).toBe(true);
  });

  it('should immediately return false when the page is hidden', () => {
    visibilityState = 'hidden';
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    expect(sut()).toBe(false);
  });

  it('should return undefined when document.visibilityState is not supported', () => {
    visibilityState = undefined;
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    expect(sut()).toBeUndefined();
  });

  it('should update its value when visibilitychange events are received', () => {
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    changeVisibility('hidden');
    expect(sut()).toBe(false);
    changeVisibility('visible');
    expect(sut()).toBe(true);
    changeVisibility(undefined);
    expect(sut()).toBeUndefined();
    changeVisibility('visible');
    expect(sut()).toBe(true);
  });

  it('should not update until a visibilitychange event is received', () => {
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    visibilityState = 'hidden';
    expect(sut()).toBe(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(sut()).toBe(false);
  });

  it('should not cause reevaluations when the visibility has not changed', () => {
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    const $computed = computedSpy(() => sut());
    expect($computed()).toBe(true);
    changeVisibility('visible');
    expect($computed()).toBe(true);
    expect($computed.timesUpdated).toBe(1);
    changeVisibility('hidden');
    expect($computed()).toBe(false);
    changeVisibility('hidden');
    expect($computed()).toBe(false);
    expect($computed.timesUpdated).toBe(2);
  });

  it('should not expose writable methods', () => {
    const sut = TestBed.runInInjectionContext(() => pageVisibleSignal());
    expect('set' in sut).toBe(false);
    expect('update' in sut).toBe(false);
  });

  it('throws when run outside an injection context and no injector is passed', () => {
    const addListener = vi.spyOn(document, 'addEventListener');
    expect(() => pageVisibleSignal()).toThrowError(/only be used within an injection context/);
    expect(addListener).not.toHaveBeenCalled();
  });

  it('should remove the event listener when the injection context is destroyed', () => {
    const fixture = createFixture();
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const sut = pageVisibleSignal({ injector: fixture.componentRef.injector });
    const listener = addListener.mock.calls.find(([type]) => type === 'visibilitychange')![1];
    fixture.destroy();
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', listener);
    changeVisibility('hidden');
    expect(sut()).toBe(true);
  });

  it('should return a readonly undefined signal when document is unavailable', () => {
    const restoreDocument = replaceGlobalProperty('document', undefined);
    try {
      const sut = pageVisibleSignal();
      expect(sut()).toBeUndefined();
      expect('set' in sut).toBe(false);
      expect('update' in sut).toBe(false);
    } finally {
      restoreDocument();
    }
  });

  /** Sets the mocked state and emits the document event that makes it observable. */
  function changeVisibility(value: DocumentVisibilityState | undefined): void {
    visibilityState = value;
    document.dispatchEvent(new Event('visibilitychange'));
  }
});
