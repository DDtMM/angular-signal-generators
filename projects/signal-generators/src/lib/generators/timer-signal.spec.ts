import { Injector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { timerSignal } from './timer-signal';

describe('timerSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;
  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  describe('as a timer', () => {

    it('should emit once after specified time.', fakeAsync(() => {
      const timer = timerSignal(1000, undefined, { injector });
      expect(timer()).toBe(0);
      tick(1000);
      expect(timer()).toBe(1);
      tick(2000);
      expect(timer()).toBe(1);
    }));

    // describe('#restart', () => {
    //   it('should increment after initial timer was complete.', fakeAsync(() => {
    //     const timer = timerSignal(1000, undefined, { injector });
    //     expect(timer()).toBe(0);
    //     tick(1000);
    //     expect(timer()).toBe(1);
    //     timer.restart();
    //     tick(1000);
    //     expect(timer()).toBe(2);
    //   }));

    //   it('should not increment if called before initial timer was complete.', fakeAsync(() => {
    //     const timer = timerSignal(1000, undefined, { injector });
    //     expect(timer()).toBe(0);
    //     tick(500);
    //     expect(timer()).toBe(0);
    //     timer.restart();
    //     tick(1000);
    //     expect(timer()).toBe(1);
    //   }));
    // });
  });
});
