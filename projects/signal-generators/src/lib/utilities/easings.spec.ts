import * as easings from './easings';

describe('easings', () => {
  Object.entries(easings).forEach(([easingName, easingFn]) => {
    describe(easingName, () => {
      it('should return 0 at start', () => expect(easingFn(0)).toBeCloseTo(0));
      it('should return 1 at end', () => expect(easingFn(1)).toBeCloseTo(1));
      it('should remain with it tolerable levels at all points', () => {
        const testPoints = [.25, .333, .5, .666, .75];
        for (const point of testPoints) {
          const value = easingFn(point);
          expect(value).toBeGreaterThan(-.1);
          expect(value).toBeLessThan(1.1);
        }
      });
    });
  });
});

