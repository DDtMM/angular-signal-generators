import { Type } from '@angular/core';
import { DebounceSignalComponent } from './home-demos/debounce-signal.component';
import { ExtendSignalComponent } from './home-demos/extend-signal.component';
import { FilterSignalComponent } from './home-demos/filter-signal.component';
import { LiftSignalComponent } from './home-demos/lift-signal.component';
import { MapSignalComponent } from './home-demos/map-signal.component';
import { ReduceSignalComponent } from './home-demos/reduce-signal.component';
import { SequenceSignalComponent } from './home-demos/sequence-signal.component';
import { SignalToIteratorComponent } from './home-demos/signal-to-iterator.component';
import { TimerSignalComponent } from './home-demos/timer-signal.component';
import { TweenSignalComponent } from './home-demos/tween-signal.component';

/** What type of signals are returned from signal factory functions. */
export type UsageType = 'generator' | 'utility' | 'writableSignal';

export interface DemoConfigurationItem<FnName extends string> {
  readonly component: Type<unknown>,
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
    component: DebounceSignalComponent,
    docUrl: './api/functions/debounceSignal.html',
    fnName: 'debounceSignal' as const,
    name: 'Debounce',
    route: 'debounce-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    component: ExtendSignalComponent,
    docUrl: './api/functions/extendSignal.html',
    fnName: 'extendSignal' as const,
    name: 'Extend',
    route: 'extend-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    component: FilterSignalComponent,
    docUrl: './api/functions/filterSignal-1.html',
    fnName: 'filterSignal'  as const,
    name: 'Filter',
    route: 'filter-signal',
    usages: ['writableSignal']
  },
  {
    component: LiftSignalComponent,
    docUrl: './api/functions/liftSignal.html',
    fnName: 'liftSignal' as const,
    name: 'Lift',
    route: 'lift-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    component: MapSignalComponent,
    docUrl: './api/functions/mapSignal-1.html',
    fnName: 'mapSignal' as const,
    name: 'Map',
    route: 'map-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    component: ReduceSignalComponent,
    docUrl: './api/functions/reduceSignal-1.html',
    fnName: 'reduceSignal' as const,
    name: 'Reduce',
    route: 'reduce-signal',
    usages: ['writableSignal']
  },
  {
    component: SequenceSignalComponent,
    docUrl: './api/functions/sequenceSignal-1.html',
    fnName: 'sequenceSignal' as const,
    name: 'Sequence',
    route: 'sequence-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    component: SignalToIteratorComponent,
    docUrl: './api/functions/signalToIterator.html',
    fnName: 'signalToIterator' as const,
    name: 'SignalToIterator',
    route: 'signal-to-iterator',
    usages: ['utility']
  },
  {
    component: TimerSignalComponent,
    docUrl: './api/functions/timerSignal-1.html',
    fnName: 'timerSignal' as const,
    name: 'Timer',
    route: 'timer-signal',
    usages: ['generator', 'writableSignal']
  },
  {
    component: TweenSignalComponent,
    docUrl: './api/functions/tweenSignal-1.html',
    fnName: 'tweenSignal' as const,
    name: 'Tween',
    route: 'tween-signal',
    usages: ['generator', 'writableSignal']
  }
] satisfies DemoConfigurationItem<string>[];

export type SignalFunctionName = typeof DEMO_CONFIGURATIONS[number]['fnName'];

export const DEMO_CONFIG_MAP = DEMO_CONFIGURATIONS.reduce((prior, cur) => ({ ...prior, [cur.fnName]: cur}),
  {} as Record<SignalFunctionName, DemoConfigurationItem<SignalFunctionName>>)
