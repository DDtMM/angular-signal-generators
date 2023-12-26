/*
 * Public API Surface of signal-generators
 */
export { EasingName, EASING_NAMES } from './lib/internal/animations';
export * from './lib/generators/debounce-signal';
export * from './lib/generators/extend-signal';
export * from './lib/generators/filter-signal';
export * from './lib/generators/lift-signal';
export * from './lib/generators/map-signal';
export * from './lib/generators/reduce-signal';
export * from './lib/generators/sequence-signal';
export * from './lib/generators/timer-signal';
export * from './lib/generators/tween-signal';
export * from './lib/signal-input';
export { SignalFunction, SignalFunctions, SignalProxy } from './lib/signal-proxy';
export { ValueSource, ValueSourceValue }  from './lib/value-source';
