import { signal } from '@angular/core';
import { objectSignal } from './object-signal';

describe('objectSignal', () => {

  it('initially returns the initial value', () => {
    const src = objectSignal([1, 2, 3], []);
    expect(src()).toEqual([1, 2, 3]);
  });

  [
    { label: 'object', src: () => [1, 2, 3] },
    { label: 'signal', src: () => signal([1, 2, 3]) }
  ].forEach(({ label, src }) => {
    it(`adds methods to a passed ${label} that mutate the value when called`, () => {
      const obj = objectSignal(src(), ['push']);
      obj.push(4);
      // obj.filter(x => x === 2);
      expect(obj()).toEqual([1, 2, 3, 4]);
    });
    it(`adds methods to a passed ${label} that update the value when called`, () => {
      const obj = objectSignal(src(), null, ['filter']);
      // obj.push(1);
      obj.filter(x => x === 2);
      expect(obj()).toEqual([2]);
    });
  })

});
