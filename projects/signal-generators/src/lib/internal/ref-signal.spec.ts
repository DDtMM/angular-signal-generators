import { setupGeneralSignalTests } from '../../testing/general-signal-tests.spec';
import { refSignal } from './ref-signal';

describe('refSignal', () => {
  setupGeneralSignalTests(() => refSignal(1));

  describe('when initial value is value', () => {
    it('is the initially the value passed in the constructor', () => {
      expect(refSignal(1)()).toEqual({ ref: 1 });
    });
    it('#asReadonly returns itself', () => {
      const value = refSignal([1]);
      expect(value.asReadonly()).toBe(value);
    });
    it('#set properly updates the value', () => {
      const value = refSignal(1);
      value.set(2);
      expect(value()).toEqual({ ref: 2 });
    });
    it('#update properly updates the value', () => {
      const value = refSignal(1);
      value.update((x) => x + 3);
      expect(value()).toEqual({ ref: 4 });
    });
    it('should emit a value even if the source was set to the same value', () => {
      const value = refSignal(1);
      const initialValue = value();
      value.set(1);
      const nextValue = value();
      expect(nextValue).toEqual(initialValue);
      expect(nextValue).not.toBe(initialValue);
    });
  });
  // describe('when initial value is signal', () => {
  //   it('is the initially the value of the signal passed in the constructor', () => {
  //     expect(refSignal(signal(2))()).toEqual({ ref: 2 });
  //   });
  //   it('should emit a value even if the source was set to the same value', () => {
  //     const originalValue = { obj: 2 };
  //     const source = signal(originalValue, { equal: () => false });
  //     const value = refSignal(source);
  //     const initialValue = value();
  //     source.set(originalValue);
  //     const nextValue = value();
  //     expect(nextValue).toEqual(initialValue);
  //     expect(nextValue).not.toBe(initialValue);
  //   });
  // });


});
