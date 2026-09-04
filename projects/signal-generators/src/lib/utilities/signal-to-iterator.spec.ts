import { Component, computed, Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { runInjectorOptionTest } from '../../testing/common-signal-tests';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { createFixture } from '../../testing/testing-utilities';
import { signalToIterator } from './signal-to-iterator';

describe('signalToIterator', () => {
  runInjectorOptionTest((injector) => {
    const source = signal(1);
    const sut = signalToIterator(signal(1), { injector });
    return () => {
      source.set(2);
      sut.next();
    };
  });

  describe('manual injector context', () => {
    let fixture: ComponentFixture<unknown>;
    let injector: Injector;

    beforeEach(() => {
      fixture = createFixture();
      injector = fixture.componentRef.injector;
    });

    it('will emit the current value even without change detection', async () => {
      const source = signal(1);
      const iterator = signalToIterator(source, { injector });
      await expect(iterator.next()).resolves.toEqual({ done: false, value: 1 });
    });

    it('will emit the current value for a late subscriber', async () => {
      const source = autoDetectChangesSignal(signal(1), fixture);
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
      })();
      source.set(4);
      fixture.destroy();
    });

    it('will retain changes for later emission', async () => {
      const source = autoDetectChangesSignal(signal(1), fixture);
      const iterator = signalToIterator(source, { injector });
      source.set(2);
      source.set(3);
      await Promise.all([
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 2 })),
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 3 }))
      ]);
    });

    it('will defer emission until they are received', async () => {
      const source = autoDetectChangesSignal(signal(1), fixture);
      const iterator = signalToIterator(source, { injector });
      const emissions = Promise.all([
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 2 })),
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 3 }))
      ]);
      source.set(2);
      source.set(3);
      await emissions;
    });

    it('will work with computed signals', async () => {
      const source = autoDetectChangesSignal(signal(1), fixture);
      const inBetween = computed(() => source() + 1);
      const iterator = signalToIterator(inBetween, { injector });
      (async () => {
        const emissions: number[] = [];
        for await (const item of iterator) {
          emissions.push(item);
        }
        expect(emissions).toEqual([2, 3, 4]);
      })();
      source.set(2);
      source.set(3);
      fixture.destroy();
    });

    it('will work with multiple loops as once', async () => {
      const source = autoDetectChangesSignal(signal(1), fixture);
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
      await Promise.all([fn1, fn2]).then(() => {});
    });

    describe('when calling return', () => {
      it('will stop if iterator.return is called', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        const emissionsPromise = (async () => {
          let res: IteratorResult<number>;
          const emissions: number[] = [];
          while (!(res = await iterator.next()).done) {
            emissions.push(res.value);
          }
          expect(emissions).toEqual([1, 2]);
          expect(res.value).toEqual('bye');
          return emissions;
        })();
        source.set(2);
        iterator.return('bye');
        source.set(3); // this should not get emitted
        await expect(emissionsPromise).resolves.toEqual([1, 2]);
      });

      it('will return done from calls to next that have not been resolved yet', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        const emissions = Promise.all([
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then((x) => expect(x).toEqual({ done: true, value: 'plop' }))
        ]);
        iterator.return('plop');
        await emissions;
      });

      it('will return done from calls to next after iterator is already completed', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        source.set(2);
        iterator.return('plop');
        await Promise.all([
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 2 })),
          iterator.next().then((x) => expect(x).toEqual({ done: true, value: 'plop' })),
          iterator.next().then((x) => expect(x).toEqual({ done: true, value: 'plop' }))
        ]);
      });
    });

    describe('when calling throw', () => {
      it('will reject waiting calls when iterator is thrown', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        await Promise.all([
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
          iterator
            .next()
            .then(() => expect.fail())
            .catch((x) => expect(x).toEqual('error')),
          iterator.throw('error').catch(() => {})
        ]);
      });
      it('will stop and return rejected promise', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        const emissions: number[] = [];
        const emissionsPromise = (async () => {
          let res: IteratorResult<number> | undefined;
          while (!(res = await iterator.next()).done) {
            emissions.push(res.value);
          }
          expect(emissions).toEqual([1, 2]);
          return emissions;
        })().catch(() => emissions);
        fixture.detectChanges();
        source.set(2);
        await expect(iterator.throw('error')).rejects.toBe('error');
        fixture.detectChanges();
        source.set(3); // this should not get emitted
        await expect(emissionsPromise).resolves.toEqual([1, 2]);
      });
    });

    describe('when injector is destroyed', () => {
      it('will stop emitting once injector is destroyed', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        (async () => {
          const emissions: number[] = [];
          for await (const item of iterator) {
            emissions.push(item);
          }
          expect(emissions).toEqual([1, 2, 3]);
        })();
        source.set(2);
        source.set(3);
        fixture.destroy();
        source.set(4);
      });
      it('will resolve outstanding calls to next when destroyed', async () => {
        const source = autoDetectChangesSignal(signal(1), fixture);
        const iterator = signalToIterator(source, { injector });
        const emissions = Promise.all([
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
          iterator.next().then((x) => expect(x).toEqual({ done: false, value: 2 })),
          iterator.next().then((x) => expect(x).toEqual({ done: true, value: undefined }))
        ]);
        source.set(2);
        fixture.destroy();
        await emissions;
      });
    });
  });

  describe('in component injector context', () => {
    @Component({ template: '' })
    class TestComponent {
      source = signal(1);
      iterator = signalToIterator(this.source);
    }
    it('will work without passing injector', async () => {
      const fixture = TestBed.createComponent(TestComponent);
      const { iterator, source } = fixture.componentInstance;
      const emissions = Promise.all([
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 1 })),
        iterator.next().then((x) => expect(x).toEqual({ done: false, value: 2 }))
      ]);
      source.set(2);
      fixture.detectChanges();
      await emissions;
    });
  });
});
