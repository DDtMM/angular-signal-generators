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
import { onlineSignal } from './online-signal';

describe('onlineSignal', () => {
  let restoreNavigator: () => void;
  let fakeNavigator: { onLine: boolean | undefined };
  beforeEach(() => {
    fakeNavigator = { onLine: true };
    restoreNavigator = replaceGlobalProperty('navigator', fakeNavigator);
  });
  afterEach(() => restoreNavigator());

  runTypeGuardTests(() => onlineSignal());
  runDebugNameOptionTest((debugName) => onlineSignal({ debugName }));
  runInjectorOptionTest((injector) => onlineSignal({ injector }));
  runComputedAndEffectTests(() => [onlineSignal(), () => window.dispatchEvent(new Event('offline'))]);
  runDoesNotCauseReevaluationsSimplyWhenNested(
    () => onlineSignal(),
    () => window.dispatchEvent(new Event('offline'))
  );

  it('should immediately return true when navigator is online', () => {
    const sut = TestBed.runInInjectionContext(() => onlineSignal());
    expect(sut()).toBe(true);
  });

  it('should immediately return false when navigator is offline', () => {
    fakeNavigator.onLine = false;
    const sut = TestBed.runInInjectionContext(() => onlineSignal());
    expect(sut()).toBe(false);
  });

  it('should return undefined when navigator.onLine is not supported', () => {
    fakeNavigator.onLine = undefined;
    const sut = TestBed.runInInjectionContext(() => onlineSignal());
    expect(sut()).toBeUndefined();
  });

  it('should update its value when online and offline events are received', () => {
    const sut = TestBed.runInInjectionContext(() => onlineSignal());
    window.dispatchEvent(new Event('offline'));
    expect(sut()).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(sut()).toBe(true);
    window.dispatchEvent(new Event('offline'));
    expect(sut()).toBe(false);
  });

  it('should not cause reevaluations when the online status has not changed', () => {
    const sut = TestBed.runInInjectionContext(() => onlineSignal());
    const $computed = computedSpy(() => sut());
    expect($computed()).toBe(true);
    window.dispatchEvent(new Event('online'));
    expect($computed()).toBe(true);
    expect($computed.timesUpdated).toBe(1);
    window.dispatchEvent(new Event('offline'));
    expect($computed()).toBe(false);
    window.dispatchEvent(new Event('offline'));
    expect($computed()).toBe(false);
    expect($computed.timesUpdated).toBe(2);
  });

  it('should not expose writable methods', () => {
    const sut = TestBed.runInInjectionContext(() => onlineSignal());
    expect('set' in sut).toBe(false);
    expect('update' in sut).toBe(false);
  });

  it('throws when run outside an injection context and no injector is passed', () => {
    const addListener = vi.spyOn(window, 'addEventListener');
    expect(() => onlineSignal()).toThrowError(/only be used within an injection context/);
    expect(addListener).not.toHaveBeenCalled();
  });

  it('should remove both event listeners when the injection context is destroyed', () => {
    const fixture = createFixture();
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const sut = onlineSignal({ injector: fixture.componentRef.injector });
    const onlineListener = addListener.mock.calls.find(([type]) => type === 'online')![1];
    const offlineListener = addListener.mock.calls.find(([type]) => type === 'offline')![1];
    fixture.destroy();
    expect(removeListener).toHaveBeenCalledWith('online', onlineListener);
    expect(removeListener).toHaveBeenCalledWith('offline', offlineListener);
    window.dispatchEvent(new Event('offline'));
    expect(sut()).toBe(true);
  });

  describe('when browser globals are unavailable', () => {
    it('should return undefined when navigator is unavailable', () => {
      restoreNavigator();
      restoreNavigator = replaceGlobalProperty('navigator', undefined);
      const sut = onlineSignal();
      expect(sut()).toBeUndefined();
      expect('set' in sut).toBe(false);
    });

    it('should return undefined when window is unavailable', () => {
      const restoreWindow = replaceGlobalProperty('window', undefined);
      try {
        const sut = onlineSignal();
        expect(sut()).toBeUndefined();
      } finally {
        restoreWindow();
      }
    });

    describe('with no navigator', () => {
      beforeEach(() => {
        restoreNavigator();
        restoreNavigator = replaceGlobalProperty('navigator', undefined);
      });
      runTypeGuardTests(() => onlineSignal());
      runDebugNameOptionTest((debugName) => onlineSignal({ debugName }));
    });
  });
});
