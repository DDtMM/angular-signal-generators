import { signal } from '@angular/core';
import { liftSignal } from './lift-signal';

describe('liftSignal', () => {

  it('initially returns the initial value', () => {
    const src = liftSignal([1, 2, 3], []);
    expect(src()).toEqual([1, 2, 3]);
  });

  [
    { factory: () => [1, 2, 3], label: 'object' },
    { factory: () => signal([1, 2, 3]), label: 'signal' }
  ].forEach(({ factory, label }) => {
    it(`adds methods from a passed ${label} that mutate the value when called`, () => {
      const src = liftSignal(factory(), ['push', 'pop', 'shift']);
      src.push(4);
      expect(src()).toEqual([1, 2, 3, 4]);
      src.pop();
      expect(src()).toEqual([1, 2, 3]);
      src.shift();
      expect(src()).toEqual([2, 3]);
    });
    it(`adds methods from a passed ${label} that update the value when called`, () => {
      const src = liftSignal(factory(), null, ['filter']);
      src.filter(x => x === 2);
      expect(src()).toEqual([2]);
    });
  })

});
