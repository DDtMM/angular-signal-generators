/** Returns a value at a time *roughly* between 0 and 1. */
export type InterpolateStepFn<T> = (progress: number) => T;
/** Returns a function that will return an interpolated value at an point in time. */
export type InterpolateFactoryFn<T> = (a: T, b: T) => InterpolateStepFn<T>;

/** Either a number, array of numbers or a record of numbers. */
export type NumericValues = number | number[] | Record<string | number | symbol, number>;

// export function createInterpolator(currentValue: number): InterpolateFactoryFn<number>;
// export function createInterpolator(currentValue: number[]): InterpolateFactoryFn<number[]>;
// export function createInterpolator(currentValue: Record<string | number | symbol, number>): InterpolateFactoryFn<Record<string | number | symbol, number>>;
/** Creates an interpolator using an initial {@link NumericValues} to determine the type of function to use when interpolating future values.. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createInterpolator<T extends NumericValues>(currentValue: T): InterpolateFactoryFn<any> {
  
  if (typeof currentValue === 'number') {
    return (a: number, b: number) => (progress: number) => interpolateNumber(a, b, progress);
  } else if (Array.isArray(currentValue)) {
    return (a: number[], b: number[]) => (progress: number) =>
      b.map((val, index) => interpolateNumber(a[index] ?? val, val, progress));
  }
  return (a: Record<string | number | symbol, number>, b: Record<string | number | symbol, number>) => (progress: number) =>
    Object.entries(b).reduce((acc, cur) => {
      acc[cur[0]] = interpolateNumber(a[cur[0]] ?? cur[1], cur[1], progress);
      return acc;
    }, {} as typeof b);

  function interpolateNumber(a: number, b: number, progress: number): number {
    return a * (1 - progress) + b * progress;
  }
}
