import { Type } from '@angular/core';
import { AsyncSignalHomeDemoComponent } from './home-demos/async-signal-home-demo.component';
import { DebounceSignalHomeDemoComponent } from './home-demos/debounce-signal-home-demo.component';
import { ExtendSignalHomeDemoComponent } from './home-demos/extend-signal-home-demo.component';
import { FilterSignalHomeDemoComponent } from './home-demos/filter-signal-home-demo.component';
import { LiftSignalHomeDemoComponent } from './home-demos/lift-signal-home-demo.component';
import { MapSignalHomeDemoComponent } from './home-demos/map-signal-home-demo.component';
import { ReduceSignalHomeDemoComponent } from './home-demos/reduce-signal-home-demo.component';
import { SequenceSignalHomeDemoComponent } from './home-demos/sequence-signal-home-demo.component';
import { SignalToIteratorHomeDemoComponent } from './home-demos/signal-to-iterator-home-demo.component';
import { StorageSignalHomeDemoComponent } from './home-demos/storage-signal-home-demo.component';
import { TimerSignalHomeDemoComponent } from './home-demos/timer-signal-home-demo.component';
import { TweenSignalHomeDemoComponent } from './home-demos/tween-signal-home-demo.component';

/** What type of signals are returned from signal factory functions. */
export type UsageType = 'generator' | 'utility' | 'writableSignal';

export interface DemoConfigurationItem<FnName extends string> {
  readonly homeComponent: Type<unknown>;
  /** The url to the docs from the root. */
  readonly docUrl: string;
  /** Function name to generate signal.  Acts as distinct key. */
  readonly fnName: FnName;
  /** Display name */
  readonly name: string;
  /** The route from the root of the app. */
  readonly route: string;
  readonly usages: UsageType[];
}

export const DEMO_CONFIGURATIONS = [
  {
    homeComponent: AsyncSignalHomeDemoComponent,
    docUrl: './api/functions/asyncSignal-1.html',
    fnName: 'asyncSignal' as const,
    name: 'Async',
    route: 'async-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: DebounceSignalHomeDemoComponent,
    docUrl: './api/functions/debounceSignal.html',
    fnName: 'debounceSignal' as const,
    name: 'Debounce',
    route: 'debounce-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: ExtendSignalHomeDemoComponent,
    docUrl: './api/functions/extendSignal.html',
    fnName: 'extendSignal' as const,
    name: 'Extend',
    route: 'extend-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: FilterSignalHomeDemoComponent,
    docUrl: './api/functions/filterSignal-1.html',
    fnName: 'filterSignal' as const,
    name: 'Filter',
    route: 'filter-signal',
    usages: ['writableSignal']
  },
  {
    homeComponent: LiftSignalHomeDemoComponent,
    docUrl: './api/functions/liftSignal.html',
    fnName: 'liftSignal' as const,
    name: 'Lift',
    route: 'lift-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: MapSignalHomeDemoComponent,
    docUrl: './api/functions/mapSignal-1.html',
    fnName: 'mapSignal' as const,
    name: 'Map',
    route: 'map-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: ReduceSignalHomeDemoComponent,
    docUrl: './api/functions/reduceSignal-1.html',
    fnName: 'reduceSignal' as const,
    name: 'Reduce',
    route: 'reduce-signal',
    usages: ['writableSignal']
  },
  {
    homeComponent: SequenceSignalHomeDemoComponent,
    docUrl: './api/functions/sequenceSignal-1.html',
    fnName: 'sequenceSignal' as const,
    name: 'Sequence',
    route: 'sequence-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: SignalToIteratorHomeDemoComponent,
    docUrl: './api/functions/signalToIterator.html',
    fnName: 'signalToIterator' as const,
    name: 'SignalToIterator',
    route: 'signal-to-iterator',
    usages: ['utility']
  },
  {
    homeComponent: StorageSignalHomeDemoComponent,
    docUrl: './api/functions/storageSignal.html',
    fnName: 'storageSignal' as const,
    name: 'Storage',
    route: 'storage-signal',
    usages: ['writableSignal']
  },
  {
    homeComponent: TimerSignalHomeDemoComponent,
    docUrl: './api/functions/timerSignal-1.html',
    fnName: 'timerSignal' as const,
    name: 'Timer',
    route: 'timer-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    homeComponent: TweenSignalHomeDemoComponent,
    docUrl: './api/functions/tweenSignal-1.html',
    fnName: 'tweenSignal' as const,
    name: 'Tween',
    route: 'tween-signal',
    usages: ['generator', 'writableSignal']
  }
] satisfies DemoConfigurationItem<string>[];

export type SignalFunctionName = (typeof DEMO_CONFIGURATIONS)[number]['fnName'];

export const DEMO_CONFIG_MAP = DEMO_CONFIGURATIONS.reduce(
  (prior, cur) => ({ ...prior, [cur.fnName]: cur }),
  {} as Record<SignalFunctionName, DemoConfigurationItem<SignalFunctionName>>
);
