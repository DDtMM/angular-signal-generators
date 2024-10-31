/**
 * Angular Signal Generators Main Library
 * @module @ddtmm/angular-signal-generators
 */

// even though this technically comes from INTERNAL, this is exported.  Maybe we'll move it to another file later.
export { AnimationFrameFn } from './lib/internal/animation-utilities';

// all signals and utilities.
export * from './lib/signals/async-signal';
export * from './lib/signals/debounce-signal';
export * from './lib/signals/dom-observers/public-api';
export * from './lib/signals/event-signal';
export * from './lib/signals/filter-signal';
export * from './lib/signals/lift-signal';
export * from './lib/signals/map-signal';
export * from './lib/signals/media-query-signal';
export * from './lib/signals/nest-signal';
export * from './lib/signals/reduce-signal';
export * from './lib/signals/sequence-signal';
export * from './lib/signals/storage-signal';
export * from './lib/signals/timer-signal';
export * from './lib/signals/tween-signal';
export * from './lib/utilities/signal-to-iterator';
export * from './lib/utilities/inspect';

// common types
export * from './lib/reactive-source';
export * from './lib/internal/transformed-signal'; // Another "internal" module.
export { ValueSource, ValueSourceValue }  from './lib/value-source';
export { DestroyableSignal } from './lib/destroyable-signal';
