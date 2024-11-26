import { createInterpolator } from './interpolation';

describe('createInterpolator', () => {
  it('creates an interpolation function for simple numbers', () => {
    const sut = createInterpolator(1);
    expect(sut(1, 2)(.5)).toEqual(1.5);
  });
  it('creates an interpolation function for arrays of numbers', () => {
    const sut = createInterpolator([1, 2]);
    expect(sut([1,1], [3,5])(.5)).toEqual([2,3]);
  });
  it('creates an interpolation function for a record of numbers', () => {
    const sut = createInterpolator({ x: 1, y: 2 });
    expect(sut({x: 1, y: 1}, {x: 3, y: 5})(.5)).toEqual({x: 2, y: 3});
  });
});
