import { ArrayLikeCursor } from './array-like-cursor';


describe('ArrayLikeCursor', () => {
  it('#moveTo() will move cursor to the next matching element', () => {
    const sut = new ArrayLikeCursor([1, 2, 3, 2, 5], false);
    expect(sut.moveTo(2)).toEqual({ hasValue: true, value: 2 });
    expect(sut.next()).toEqual({ hasValue: true, value: 3 });
    expect(sut.moveTo(2)).toEqual({ hasValue: true, value: 2 });
    expect(sut.next()).toEqual({ hasValue: true, value: 5 });
  });
  it('#moveTo() will move cursor to end if matching element is not found and autoReset is off', () => {
    const sut = new ArrayLikeCursor([1, 2, 3, 2, 5], false);
    expect(sut.moveTo(5)).toEqual({ hasValue: true, value: 5 });
    expect(sut.moveTo(2)).toEqual({ hasValue: false });
  });
  it('#moveTo() will search from start if matching element is not found and autoReset is on', () => {
    const sut = new ArrayLikeCursor([1, 2, 3, 2, 5], true);
    expect(sut.moveTo(5)).toEqual({ hasValue: true, value: 5 });
    expect(sut.moveTo(2)).toEqual({ hasValue: true, value: 2 });
    expect(sut.next()).toEqual({ hasValue: true, value: 3 });
  });
  it('#next() returns next element and updates internal state', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    expect(sut.next()).toEqual({ hasValue: true, value: 1 });
    expect(sut.next()).toEqual({ hasValue: true, value: 2 });
  });
  it('#next() returns empty result when source is empty and autoReset is off', () => {
    const sut = new ArrayLikeCursor([], false);
    expect(sut.next().hasValue).toEqual(false);
  });
  it('#next() returns empty result when source is empty and autoReset is on', () => {
    const sut = new ArrayLikeCursor([], true);
    expect(sut.next().hasValue).toEqual(false);
  });
  it('#next(N) returns element N indices ahead of current position', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    sut.next();
    expect(sut.next(2)).toEqual({ hasValue: true, value: 3 });
  });
  it('#next(N) returns element N indices behind current position', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    sut.next(3); // move forward first and then move back from that point.
    expect(sut.next(-2)).toEqual({ hasValue: true, value: 1 });
  });

  it('#next(0) returns first element when next had not been called before', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    expect(sut.next(0)).toEqual({ hasValue: true, value: 1 });
  });
  
  it('#next(0) returns first element after reset', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    sut.reset();
    expect(sut.next(0)).toEqual({ hasValue: true, value: 1 });
  });
  it('#next(N = Array.length + 1) returns empty result when autoReset off', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    expect(sut.next(4).hasValue).toEqual(false);
  });
  it('#next(N = some value much greater that Array.length) returns result.', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], true);
    expect(sut.next(8)).toEqual({ hasValue: true, value: 2 });
  });
  it('#next(N = some value much less than Array.length) returns empty result and sets state to start position when autoReset is off', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    expect(sut.next(-8).hasValue).toEqual(false);
    // this will confirm that it was at start position.
    expect(sut.next()).toEqual({ hasValue: true, value: 1 });
  });
  it('#next(N = some value much less than Array.length) returns expected element relative to position', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], true);
    sut.next();
    expect(sut.next(-8)).toEqual({ hasValue: true, value: 2 });
  });
  it('#next(N = some value much less than Array.length) returns expected element relative to the first element', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], true);
    expect(sut.next(-1)).toEqual({ hasValue: true, value: 3 });
  });

  it('#reset() sets cursor to start state', () => {
    const sut = new ArrayLikeCursor([1, 2, 3], false);
    sut.next(2);
    sut.reset();
    // confirm we were at start state by moving to checking if next returns first element.
    expect(sut.next(1)).toEqual({ hasValue: true, value: 1 });
  });

  it('works with ArrayLike objects like strings', () => {
    const sut = new ArrayLikeCursor('abc', true);
    expect(sut.next(2)).toEqual({ hasValue: true, value: 'b' });
    sut.reset();
    expect(sut.next(0)).toEqual({ hasValue: true, value: 'a' });
    expect(sut.next(-2)).toEqual({ hasValue: true, value: 'b' });
  });

});
