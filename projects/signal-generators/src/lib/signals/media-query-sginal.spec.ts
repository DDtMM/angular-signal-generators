import { TestBed } from '@angular/core/testing';
import {
  setupComputedAndEffectTests,
  setupDoesNotCauseReevaluationsSimplyWhenNested,
  setupTypeGuardTests
} from '../../testing/common-signal-tests';
import { replaceGlobalProperty } from '../../testing/testing-utilities';
import { mediaQuerySignal } from './media-query-signal';
import { FakeEventListener } from '../../testing/fake-event-listener';
import { signal } from '@angular/core';
import { MockRender } from 'ng-mocks';

describe('mediaQuerySignal', () => {
  setupTypeGuardTests(() => mediaQuerySignal('(max-width: 600px)'));

  describe('with faked matchMedia', () => {
    let restoreMatchMedia: () => void;
    let matchMediaSpy: jasmine.Spy<typeof globalThis['matchMedia']>;
    let fakeMql: FakeMediaQueryList;
    beforeEach(() => {
      matchMediaSpy = jasmine.createSpy('matchMedia').and.callFake((query) => (fakeMql = new FakeMediaQueryList(query)) as unknown as MediaQueryList);
      restoreMatchMedia = replaceGlobalProperty('matchMedia', matchMediaSpy);
    });
    afterEach(() => restoreMatchMedia());

    setupComputedAndEffectTests(() => {
      const sut = mediaQuerySignal('(max-width: 600px)');
      return [sut, () => sut.set('(max-width: 1200px)') ];
    });
    setupDoesNotCauseReevaluationsSimplyWhenNested(
      () => mediaQuerySignal('(max-width: 600px)'),
      (sut) => sut.set('(max-width: 1200px)')
    );

    describe('from a value', () => {
      it('should update its value when the query is matched', () => {
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal('(max-width: 600px)'));
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
        fakeMql.matches = true;
        expect(sut()).toEqual({ matches: true, media: '(max-width: 600px)' });
      });

      it('should update its value when the query is changed with set', () => {
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal('(max-width: 600px)'));
        fakeMql.matches = true;
        sut.set('(max-width: 1200px)');
        expect(sut()).toEqual({ matches: false, media: '(max-width: 1200px)' });
      });

      it('throws when run outside injection context and manualDestroy not passed to options', () => {
        expect(() => mediaQuerySignal('(max-width: 600px)')).toThrowError(/only be used within an injection context/);
      });
      it('should not throw when run outside injection context and manualDestroy:true passed to options', () => {
        expect(() => mediaQuerySignal('(max-width: 600px)', { manualDestroy: true })).not.toThrow();
      });

      it('should update its value when the query is changed with update', () => {
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal('(max-width: 600px)'));
        fakeMql.matches = true;
        sut.update(x => x.replace('600px', '1600px'))
        expect(sut()).toEqual({ matches: false, media: '(max-width: 1600px)' });
      });

      it('should ignore future changes after destroy is called.', () => {
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal('(max-width: 600px)'));
        sut.destroy();
        fakeMql.matches = true; // ignore when event fires.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
        sut.set('(max-width: 1200px)'); // ignore when signal changes.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
      });

    });

    describe('from a signal', () => {
      it('should update its value when the query is matched', () => {
        const $source = signal('(max-width: 600px)');
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal($source));
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
        fakeMql.matches = true;
        expect(sut()).toEqual({ matches: true, media: '(max-width: 600px)' });
      });

      it('should update its value when the query is changed from source', () => {
        const $source = signal('(max-width: 600px)');
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal($source));
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
        fakeMql.matches = true;
        $source.set('(max-width: 1200px)');
        TestBed.flushEffects(); // we need to flush effects so that the source signal change is processed.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 1200px)' });
      });

      it('should ignore future changes after destroy is called.', () => {
        const $source = signal('(max-width: 600px)');
        const sut = TestBed.runInInjectionContext(() => mediaQuerySignal($source));
        sut.destroy();
        fakeMql.matches = true; // ignore when event fires.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
        $source.set('(max-width: 1200px)');
        TestBed.flushEffects(); // we need to flush effects so that the source signal change is processed.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
      });
      it('should ignore future changes after injection context is destroyed.', () => {
        const fixture = MockRender();
        const $source = signal('(max-width: 600px)');
        const sut = mediaQuerySignal($source, { injector: fixture.componentRef.injector});
        fixture.destroy();
        fakeMql.matches = true; // ignore when event fires.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
        $source.set('(max-width: 1200px)');
        TestBed.flushEffects(); // we need to flush effects so that the source signal change is processed.
        expect(sut()).toEqual({ matches: false, media: '(max-width: 600px)' });
      });
    });
  });
  it('returns a dummy signal with all corresponding writeable methods when matchMedia is not on globalThis', () => {
    const restoreProperty = replaceGlobalProperty('matchMedia', undefined);
    const sut = TestBed.runInInjectionContext(() => mediaQuerySignal('(max-width: 600px)'));
    expect(sut()).toEqual({ matches: false, media: 'matchMedia is not supported' });
    sut.set('(max-width: 1200px)');
    expect(sut()).toEqual({ matches: false, media: 'matchMedia is not supported' });
    sut.update(x => x.replace('1200', '1800'));
    expect(sut()).toEqual({ matches: false, media: 'matchMedia is not supported' });
    sut.destroy();
    expect(sut()).toEqual({ matches: false, media: 'matchMedia is not supported' });
    expect(globalThis.matchMedia as unknown).toBe(undefined);
    restoreProperty();
  });
});

class FakeMediaQueryList extends FakeEventListener<keyof MediaQueryListEventMap, MediaQueryListEventMap>  implements Pick<MediaQueryList, 'matches' | 'media'> {
  private _matches = false;

  get matches() {
    return this._matches;
  }
  set matches(value: boolean) {
    this._matches = value;
    const event = new MediaQueryListEvent('change', { matches: value, media: this.media });
    this.getOrCreateTypeSet('change').forEach((listener) => listener(event));
  }
  constructor(public readonly media: string) {
    super();
  }
}
