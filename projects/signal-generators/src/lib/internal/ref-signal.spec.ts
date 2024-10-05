import { setupComputedAndEffectTests, setupTypeGuardTests } from '../../testing/common-signal-tests';
import { refSignal } from './ref-signal';

describe('refSignal', () => {
  setupTypeGuardTests(() => refSignal(1));

  describe('when initial value is value', () => {
    setupComputedAndEffectTests(() => {
      const sut = refSignal(1);
      return [sut, () => { sut.set(1); }];
    });

    it('is the initially the value passed in the constructor', () => {
      expect(refSignal(1)()).toEqual({ ref: 1 });
    });
    it('#asReadonly returns a signal that reflects the original', () => {
      const sut = refSignal([1]);
      const roSut = sut.asReadonly();
      sut.set([2]);
      expect(roSut()).toEqual({ ref: [2] });
    });
    it('#set properly updates the value', () => {
      const sut = refSignal(1);
      sut.set(2);
      expect(sut()).toEqual({ ref: 2 });
    });
    it('#update properly updates the value', () => {
      const sut = refSignal(1);
      sut.update((x) => x + 3);
      expect(sut()).toEqual({ ref: 4 });
    });
    it('should emit a value even if the source was set to the same value', () => {
      const sut = refSignal(1);
      const initialValue = sut();
      sut.set(1);
      const nextValue = sut();
      expect(nextValue).toEqual(initialValue);
      expect(nextValue).not.toBe(initialValue);
    });
  });
});
