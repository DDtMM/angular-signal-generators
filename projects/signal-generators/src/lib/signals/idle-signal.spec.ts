import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { runComputedAndEffectTests, runDebugNameOptionTest, runDoesNotCauseReevaluationsSimplyWhenNested, runTypeGuardTests } from '../../testing/common-signal-tests';
import { createFixture } from '../../testing/testing-utilities';
import { idleSignal, provideIdleSignalGlobalOptions } from './idle-signal';

describe('idleSignal', () => {
  let fixture: ReturnType<typeof createFixture>;

  beforeEach(() => {
    fixture = createFixture();
  });

  runDebugNameOptionTest((debugName) => idleSignal({ debugName, injector: fixture.componentRef.injector }));
  runTypeGuardTests(() => idleSignal({ injector: fixture.componentRef.injector }));
  runComputedAndEffectTests(() => {
    const sut = idleSignal({ injector: fixture.componentRef.injector });
    return [sut, () => { /* signal is readonly */ }];
  });
  runDoesNotCauseReevaluationsSimplyWhenNested(
    () => idleSignal({ injector: fixture.componentRef.injector }),
    () => { /* signal is readonly */ }
  );

  describe('initialization', () => {
    it('should start with initialized state', () => {
      const sut = idleSignal({ injector: fixture.componentRef.injector });
      const state = sut();
      expect(state.isIdle).toBe(false);
      expect(state.changeReason).toBe('initialized');
      expect(state.timeSinceLastChange).toBe(0);
    });

    it('should use default idle timeout of 60000ms', fakeAsync(() => {
      const sut = idleSignal({ injector: fixture.componentRef.injector });
      tick(59999);
      expect(sut().isIdle).toBe(false);
      tick(1);
      expect(sut().isIdle).toBe(true);
    }));

    it('should use custom idle timeout', fakeAsync(() => {
      const sut = idleSignal({ idleTimeout: 30000, injector: fixture.componentRef.injector });
      tick(29999);
      expect(sut().isIdle).toBe(false);
      tick(1);
      expect(sut().isIdle).toBe(true);
    }));

    it('should use injection context when not passed as option', fakeAsync(() => {
      const sut = TestBed.runInInjectionContext(() => idleSignal({ idleTimeout: 5000 }));
      tick(4999);
      expect(sut().isIdle).toBe(false);
      tick(1);
      expect(sut().isIdle).toBe(true);
    }));
  });

  describe('event detection', () => {
    it('should become idle after timeout with no activity', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      expect(sut().isIdle).toBe(false);
      tick(5000);
      expect(sut().isIdle).toBe(true);
      expect(sut().changeReason).toBe('idling');
    }));

    it('should reset idle timer on activity', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      tick(5000);
      expect(sut().isIdle).toBe(true);

      // Trigger activity
      window.dispatchEvent(new Event('mousedown'));
      tick(4000);
      expect(sut().isIdle).toBe(false);
    }));

    it('should update changeReason to event type only when activity changes idle state', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      window.dispatchEvent(new Event('keydown'));
      tick(2000); // too soon.
      expect(sut().changeReason).toBe('initialized');
      tick(3000);
      window.dispatchEvent(new Event('mousemove'));
      expect(sut().changeReason).toBe('mousemove');
    }));

    it('should listen to custom events', fakeAsync(() => {
      const sut = idleSignal({
        events: ['custom-event'],
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      tick(5000);
      expect(sut().isIdle).toBe(true);

      window.dispatchEvent(new Event('custom-event'));
      expect(sut().isIdle).toBe(false);
      expect(sut().changeReason).toBe('custom-event');
    }));

    it('should listen to default events when no custom events specified', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      tick(5000);
      expect(sut().isIdle).toBe(true);

      const defaultEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
      
      for (const eventName of defaultEvents) {
        window.dispatchEvent(new Event(eventName));
        expect(sut().isIdle).withContext(`Event: ${eventName}`).toBe(false);
        tick(5000);
        expect(sut().isIdle).withContext(`After timeout for ${eventName}`).toBe(true);
      }
    }));
  });

  describe('timeSinceLastChange', () => {

    it('should reset timeSinceLastChange on activity', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      tick(5000);
      expect(sut().isIdle).toBe(true);
      tick(2000);
      window.dispatchEvent(new Event('mousedown'));
      expect(sut().timeSinceLastChange).toBe(2000);
    }));

    it('should reset timeSinceLastChange when transitioning to idle', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      tick(5000);
      expect(sut().isIdle).toBe(true);
      expect(sut().timeSinceLastChange).toBe(5000);
    }));
  });



  describe('cleanup', () => {
    it('should clean up timers when destroyed', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      fixture.destroy();
      tick(5000);

      // After destroy, no errors should be thrown
      expect(sut().isIdle).toBe(false);
    }));

    it('should clean up event listeners when destroyed', fakeAsync(() => {
      const sut = idleSignal({
        idleTimeout: 5000,
        injector: fixture.componentRef.injector
      });

      tick(5000);
      expect(sut().isIdle).toBe(true);

      fixture.destroy();

      // Dispatching events after destroy should not affect the signal
      window.dispatchEvent(new Event('mousedown'));
      expect(sut().isIdle).toBe(true);
    }));
  });
});

// These tests have their own custom setup and can't use the global, dummy createFixture.
describe('idleSignal', () => {
  describe('provideIdleSignalGlobalOptions', () => {
    it('should use global idleTimeout option', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ idleTimeout: 10000 })]
      });

      const sut = idleSignal({ injector: customFixture.componentRef.injector });
      
      tick(9999);
      expect(sut().isIdle).toBe(false);
      tick(1);
      expect(sut().isIdle).toBe(true);
    }));

    it('should use global events option', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ events: ['custom-global-event'] })]
      });

      const sut = idleSignal({ 
        idleTimeout: 5000,
        injector: customFixture.componentRef.injector 
      });
      
      tick(5000);
      expect(sut().isIdle).toBe(true);

      // Default events should not work
      window.dispatchEvent(new Event('mousedown'));
      expect(sut().isIdle).toBe(true);

      // Custom global event should work
      window.dispatchEvent(new Event('custom-global-event'));
      expect(sut().isIdle).toBe(false);
      expect(sut().changeReason).toBe('custom-global-event');
    }));

    it('should allow local options to override global idleTimeout', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ idleTimeout: 10000 })]
      });

      const sut = idleSignal({ 
        idleTimeout: 3000,
        injector: customFixture.componentRef.injector 
      });
      
      tick(2999);
      expect(sut().isIdle).toBe(false);
      tick(1);
      expect(sut().isIdle).toBe(true);
    }));

    it('should allow local options to override global events', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ events: ['global-event'] })]
      });

      const sut = idleSignal({ 
        events: ['local-event'],
        idleTimeout: 5000,
        injector: customFixture.componentRef.injector 
      });
      
      tick(5000);
      expect(sut().isIdle).toBe(true);

      // Global event should not work
      window.dispatchEvent(new Event('global-event'));
      expect(sut().isIdle).toBe(true);

      // Local event should work
      window.dispatchEvent(new Event('local-event'));
      expect(sut().isIdle).toBe(false);
      expect(sut().changeReason).toBe('local-event');
    }));

    it('should apply global options to multiple signal instances', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ 
          idleTimeout: 8000,
          events: ['shared-event']
        })]
      });

      const sut1 = idleSignal({ injector: customFixture.componentRef.injector });
      const sut2 = idleSignal({ injector: customFixture.componentRef.injector });
      
      tick(8000);
      expect(sut1().isIdle).toBe(true);
      expect(sut2().isIdle).toBe(true);

      window.dispatchEvent(new Event('shared-event'));
      expect(sut1().isIdle).toBe(false);
      expect(sut2().isIdle).toBe(false);
    }));

    it('should use default events when only global idleTimeout is provided', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ idleTimeout: 7000 })]
      });

      const sut = idleSignal({ injector: customFixture.componentRef.injector });
      
      tick(7000);
      expect(sut().isIdle).toBe(true);

      // Default event should still work
      window.dispatchEvent(new Event('mousedown'));
      expect(sut().isIdle).toBe(false);
    }));

    it('should use default idleTimeout when only global events are provided', fakeAsync(() => {
      const customFixture = createFixture({
        providers: [provideIdleSignalGlobalOptions({ events: ['click'] })]
      });

      const sut = idleSignal({ injector: customFixture.componentRef.injector });
      
      tick(60000);
      expect(sut().isIdle).toBe(true);

      window.dispatchEvent(new Event('click'));
      expect(sut().isIdle).toBe(false);
    }));
  });

});
