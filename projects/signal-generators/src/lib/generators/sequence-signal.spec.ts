import { Injector } from '@angular/core';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { sequenceSignal } from './sequence-signal';

fdescribe('sequenceSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  makeSequenceTypes([] as number[]).forEach(({ label, sequenceFactory }) =>
    it(`throws when trying to access empty ${label} sequenceFactory`, () => {
      expect(() => sequenceSignal(sequenceFactory())).toThrowError();
    })
  );
  makeSequenceTypes([526, 152, 422]).forEach(({ label, sequenceFactory, source }) =>
    describe(`from ${label}`, () => {
      it(`is initially the first value`, () => {
        expect(sequenceSignal(sequenceFactory())()).toEqual(source[0]);
      });
      it('will move to the second value when next is called.', () => {
        const result = sequenceSignal(sequenceFactory());
        result.next();
        expect(result()).toEqual(source[1]);
      });
      it('will move forward based on the next parameter.', () => {
        const result = sequenceSignal(sequenceFactory());
        result.next(2);
        expect(result()).toEqual(source[2]);
      });
      it('will return the last element when moving past the last element and autoReset is off.', () => {
        const result = sequenceSignal(sequenceFactory(), { disableAutoReset: true });
        result.next(4);
        expect(result()).toEqual(source[2]);
      });
    })
  );

  describe('from array', () => {
    const source = [152, 754, 411];
    const sequenceFactory = () => source;
    it(`will loop when moving past the last element and autoReset is on.`, () => {
      const result = sequenceSignal(sequenceFactory());
      result.next(4);
      expect(result()).toEqual(source[1]);
    });
    it(`will move backwards when a negative value is passed to result.`, () => {
      const result = sequenceSignal(sequenceFactory());
      result.next(2);
      expect(result()).toEqual(source[2]);
      result.next(-1);
      expect(result()).toEqual(source[1]);
    });
    it('is the first value after reset', () => {
      const result = sequenceSignal(sequenceFactory());
      result.next();
      result.reset();
      expect(result()).toEqual(source[0]);
    });
  });
  // describe('from Iterator', () => {
  //   const source = [152, 754, 411];
  //   const sequenceFactory = () => createIterator(source);
  //   it(`will throw if it can't reset.`, () => {

  //   });
  // });

  function makeSequenceTypes<T>(data: T[]): { label: string, sequenceFactory: () => Iterable<T> | T[], source: T[] }[] {
    return [
      { label: 'Array', sequenceFactory: () => [...data ], source: data },
      { label: 'Iterator', sequenceFactory: () => createIterator([...data]), source: data },
    ]
  }
  function* createIterator<T>(values: T[]): Generator<T, void, unknown> {
    for (let i = 0; i < values.length; i++) {
      yield values[i];
    }
  }

});
