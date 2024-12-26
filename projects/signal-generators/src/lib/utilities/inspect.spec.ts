import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { setProdMode } from '../../testing/dev-mode-utilities';
import { replaceGlobalProperty } from '../../testing/testing-utilities';
import { INSPECT_DEFAULTS, inspect } from './inspect';

const originalDefaults = { ...INSPECT_DEFAULTS };

describe('inspect', () => {
  describe('with mocked global defaults', () => {
    let reporterSpy: jasmine.Spy;

    beforeEach(() => (reporterSpy = INSPECT_DEFAULTS.reporter = jasmine.createSpy('reporter', INSPECT_DEFAULTS.reporter)));
    afterEach(() => (INSPECT_DEFAULTS.reporter = originalDefaults.reporter));

    it('should log initial value', () =>
      TestBed.runInInjectionContext(() => {
        const source = signal('hello there');
        inspect(source);
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledWith('hello there');
      }));

    it('should log any changes', () =>
      TestBed.runInInjectionContext(() => {
        const source = signal('hello there');
        inspect(source);
        TestBed.flushEffects();
        source.set('goodbye');
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledWith('hello there');
        expect(reporterSpy).toHaveBeenCalledWith('goodbye');
      }));

    it('should skip first effect emission skipInitial provided as true.', () =>
      TestBed.runInInjectionContext(() => {
        const source = signal('hello there');
        inspect(source, { skipInitial: true });
        TestBed.flushEffects();
        source.set('goodbye');
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledTimes(1);
        expect(reporterSpy).toHaveBeenCalledWith('goodbye');
      }));
    it('should skip first effect emission when global value is set to true.', () =>
      TestBed.runInInjectionContext(() => {
        INSPECT_DEFAULTS.skipInitial = true;
        const source = signal('hello there');
        inspect(source);
        TestBed.flushEffects();
        source.set('goodbye');
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledTimes(1);
        expect(reporterSpy).toHaveBeenCalledWith('goodbye');
        INSPECT_DEFAULTS.skipInitial = originalDefaults.skipInitial;
      }));

    it('should log deeply nested changes', () =>
      TestBed.runInInjectionContext(() => {
        const inner = signal(5);
        const source = signal({ values: [0, { sum: computed(() => inner() + 2) }] });
        inspect(source);
        TestBed.flushEffects();
        inner.set(10);
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledWith({ values: [0, { sum: 12 }] });
      }));

    it('should use reporter when provided', () =>
      TestBed.runInInjectionContext(() => {
        const source = signal('hello there');
        const altReporter = jasmine.createSpy();
        inspect(source, { reporter: altReporter });
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledTimes(0);
        expect(altReporter).toHaveBeenCalledWith('hello there');
      }));
    it('should ignore any errors', () =>
      TestBed.runInInjectionContext(() => {
        const trap = {
          get someValue() { throw new Error('someValue will always throw'); }
        };
        const consoleSpyObj = jasmine.createSpyObj('console', ['error', 'warn']);
        const restoreConsole = replaceGlobalProperty('console', consoleSpyObj);
        inspect([signal({ trap, value: 1 })], { ignoreErrors: true });
        TestBed.flushEffects();
        expect(reporterSpy).toHaveBeenCalledWith([{ trap: undefined, value: 1 } as any]);
        expect(consoleSpyObj.warn).toHaveBeenCalled();
        restoreConsole();
      }));
    describe('in prod mode', () => {
      beforeEach(() => (setProdMode(true)));
      afterEach(() => (setProdMode(false)));
      it('should do nothing', () => {
        const source = signal('hello there');
        inspect(source);
        TestBed.flushEffects(); // there should be no effects.  This would throw if there were.
        expect(reporterSpy).toHaveBeenCalledTimes(0);
      });
      it('should work if it runInProdMode is passed in options', () =>
        TestBed.runInInjectionContext(() => {
          const source = signal('hello there again');
          inspect(source, { runInProdMode: true });
          TestBed.flushEffects();
          expect(reporterSpy).toHaveBeenCalledWith('hello there again');
        }));
      it('should work if it runInProdMode is true in global defaults', () =>
        TestBed.runInInjectionContext(() => {
          INSPECT_DEFAULTS.runInProdMode = true;
          const source = signal('hello there!!');
          inspect(source);
          TestBed.flushEffects();
          expect(reporterSpy).toHaveBeenCalledWith('hello there!!');
          INSPECT_DEFAULTS.runInProdMode = originalDefaults.runInProdMode;
        }));
    });
  });

  describe('global defaults', () => {
    it('should logging to console.log', () => {
      const consoleSpyObj = jasmine.createSpyObj('console', ['log']);
      const restoreConsole = replaceGlobalProperty('console', consoleSpyObj);
      INSPECT_DEFAULTS.reporter('test 1 2 3');
      expect(consoleSpyObj.log).toHaveBeenCalledWith('test 1 2 3');
      restoreConsole();
    });
    it('should not skip first emission', () => {
      expect(INSPECT_DEFAULTS.skipInitial).toBe(false);
    });
  });
});
