/*
 * Public API Surface of signal-generators
 */
export * from './lib/signals/async-signal';
export * from './lib/signals/debounce-signal';
export * from './lib/signals/extend-signal';
export * from './lib/signals/filter-signal';
export * from './lib/signals/lift-signal';
export * from './lib/signals/map-signal';
export * from './lib/signals/reduce-signal';
export * from './lib/signals/sequence-signal';
export * from './lib/signals/storage-signal';
export * from './lib/signals/timer-signal';
export * from './lib/signals/tween-signal';
export * from './lib/utilities/easings';
export * as easings from './lib/utilities/easings';
export * from './lib/utilities/signal-to-iterator';
export * from './lib/signal-input';
export { SignalFunction, SignalFunctions, SignalProxy } from './lib/signal-proxy';
export { ValueSource, ValueSourceValue }  from './lib/value-source';
