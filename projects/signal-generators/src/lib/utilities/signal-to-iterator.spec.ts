import { Component, Injector, computed, signal } from '@angular/core';
import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { signalToIterator } from './signal-to-iterator';

describe('signalToIterator', () => {
  describe('manual injector context', () => {
    let fixture: MockedComponentFixture<void, void>;
    let injector: Injector;

    beforeEach(() => {
      fixture = MockRender();
      injector = fixture.componentRef.injector;
    });

    it('will emit the current value even without change detection', (done) => {
      const source = signal(1);
      const iterator = signalToIterator(source, { injector });
      iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })).then(() => done());
    });

    it('will emit the current value for a late subscriber', (done) => {
      const source = autoDetectChangesSignal(fixture, signal(1));
      (async () => {
        const emissions: number[] = [];
        for await (const item of signalToIterator(source, { injector })) {
          emissions.push(item);
        }
        expect(emissions).toEqual([1, 2, 3, 4]);
      })();
      source.set(2);
      source.set(3);
      (async () => {
        const emissions: number[] = [];
        for await (const item of signalToIterator(source, { injector })) {
          emissions.push(item);
        }
        expect(emissions).toEqual([3, 4]);
        done();
      })();
      source.set(4);
      fixture.destroy();
    });

    it('will retain changes for later emission', (done) => {
      const source = autoDetectChangesSignal(fixture, signal(1));
      const iterator = signalToIterator(source, { injector });
      source.set(2);
      source.set(3);
      Promise.all([
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })),
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 2 })),
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 3 }))
      ]).then(() => done());
    });

    it('will defer emission until they are received', (done) => {
      const source = autoDetectChangesSignal(fixture, signal(1));
      const iterator = signalToIterator(source, { injector });
      Promise.all([
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })),
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 2 })),
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 3 }))
      ]).then(() => done());
      source.set(2);
      source.set(3);
    });

    it('will work with computed signals', (done) => {
      const source = autoDetectChangesSignal(fixture, signal(1));
      const inBetween = computed(() => source() + 1);
      const iterator = signalToIterator(inBetween, { injector });
      (async () => {
        const emissions: number[] = [];
        for await (const item of iterator) {
          emissions.push(item);
        }
        expect(emissions).toEqual([2, 3, 4]);
        done();
      })();
      source.set(2);
      source.set(3);
      fixture.destroy();
    });

    it('will work with multiple loops as once', (done) => {
      const source = autoDetectChangesSignal(fixture, signal(1));
      const testFn = async (iterator: AsyncIterableIterator<number>) => {
        const emissions: number[] = [];
        for await (const item of iterator) {
          emissions.push(item);
        }
        expect(emissions).toEqual([1, 2, 3]);
      };
      const fn1 = testFn(signalToIterator(source, { injector }));
      fixture.detectChanges();
      const fn2 = testFn(signalToIterator(source, { injector }));
      source.set(2);
      source.set(3);
      fixture.destroy();
      Promise.all([fn1, fn2]).then(() => done());
    });

    describe('when calling return', () => {
      it('will stop if iterator.return is called', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        (async () => {
          let res: IteratorResult<number>;
          const emissions: number[] = [];
          while (!(res = await iterator.next()).done) {
            emissions.push(res.value);
          }
          expect(emissions).toEqual([1, 2]);
          expect(res.value).toEqual('bye');
          done();
        })();
        source.set(2);
        iterator.return('bye');
        source.set(3); // this should not get emitted
      });

      it('will return done from calls to next that have not been resolved yet', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        Promise.all([
          iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then(x => expect(x).toEqual({ done: true, value: 'plop' }))
        ]).then(() => done());
        iterator.return('plop');
      });

      it('will return done from calls to next after iterator is already completed', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        source.set(2);
        iterator.return('plop');
        Promise.all([
          iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then(x => expect(x).toEqual({ done: false, value: 2 })),
          iterator.next().then(x => expect(x).toEqual({ done: true, value: 'plop' })),
          iterator.next().then(x => expect(x).toEqual({ done: true, value: 'plop' }))
        ]).then(() => done());
      });
    });

    describe('when calling throw', () => {
      it('will reject waiting calls when iterator is thrown', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        Promise.all([
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then(() => fail()).catch((x) => expect(x).toEqual('error')),
          iterator.throw('error').catch(() => { /* do nothing */ })
        ]).then(() => done());
      });
      it('will stop and return rejected promise', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        (async () => {
          let res: IteratorResult<number> | undefined;
          const emissions: number[] = [];
          while (!(res = await iterator.next()).done) {
            emissions.push(res.value);
          }
          expect(emissions).toEqual([1, 2]);
          done();
        })();
        fixture.detectChanges();
        source.set(2);
        iterator.throw('error').then(() => fail()).catch((x) => expect(x).toBe('error'));
        fixture.detectChanges();
        source.set(3); // this should not get emitted
      });
    });


    describe('when injector is destroyed', () => {
      it('will stop emitting once injector is destroyed', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        (async () => {
          const emissions: number[] = [];
          for await (const item of iterator) {
            emissions.push(item);
          }
          expect(emissions).toEqual([1, 2, 3]);
          done();
        })();
        source.set(2);
        source.set(3);
        fixture.destroy();
        source.set(4);
      });
      it('will resolve outstanding calls to next when destroyed', (done) => {
        const source = autoDetectChangesSignal(fixture, signal(1));
        const iterator = signalToIterator(source, { injector });
        Promise.all([
          iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then(x => expect(x).toEqual({ done: false, value: 2 })),
          iterator.next().then(x => expect(x).toEqual({ done: true, value: undefined }))
        ]).then(() => done());
        source.set(2);
        fixture.destroy();
      });
    });
  });

  describe('in component injector context', () => {
    @Component({ standalone: true })
    class TestComponent {
      source = signal(1);
      iterator = signalToIterator(this.source);
    }
    it('will work without passing injector', (done) => {
      MockBuilder(TestComponent);
      const fixture = MockRender(TestComponent);
      const { iterator, source } = fixture.point.componentInstance;
      Promise.all([
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 1 })),
        iterator.next().then(x => expect(x).toEqual({ done: false, value: 2 }))
      ]).then(() => done());
      source.set(2);
      fixture.detectChanges();
    });
  });
});

