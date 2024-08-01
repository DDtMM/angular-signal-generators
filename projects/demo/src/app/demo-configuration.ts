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
import { AsyncSignalPageComponent } from './demos/async-signal/async-signal-page.component';
import { DebounceSignalPageComponent } from './demos/debounce-signal/debounce-signal-page.component';
import { ExtendSignalPageComponent } from './demos/extend-signal/extend-signal-page.component';
import { FilterSignalPageComponent } from './demos/filter-signal/filter-signal-page.component';
import { LiftSignalPageComponent } from './demos/lift-signal/lift-signal-page.component';
import { MapSignalPageComponent } from './demos/map-signal/map-signal-page.component';
import { ReduceSignalPageComponent } from './demos/reduce-signal/reduce-signal-page.component';
import { SequenceSignalPageComponent } from './demos/sequence-signal/sequence-signal-page.component';
import { SignalToIteratorPageComponent } from './demos/signal-to-iterator/signal-to-iterator-page.component';
import { TimerSignalPageComponent } from './demos/timer-signal/timer-signal-page.component';
import { TweenSignalPageComponent } from './demos/tween-signal/tween-signal-page.component';
import { IntersectionSignalHomeDemoComponent } from './home-demos/intersection-signal-home-demo.component';
import { MutationSignalHomeDemoComponent } from './home-demos/mutation-signal-home-demo.component';
import { ResizeSignalHomeDemoComponent } from './home-demos/resize-signal-home-demo.component';
import { ResizeSignalPageComponent } from './demos/resize-signal/resize-signal-page.component';
import { MutationSignalPageComponent } from './demos/mutation-signal/mutation-signal-page.component';
import { IntersectionSignalPageComponent } from './demos/intersection-signal/intersection-signal-page.component';
import { StorageSignalPageComponent } from './demos/storage-signal/storage-signal-page.component';
import { EventSignalHomeDemoComponent } from './home-demos/event-signal-home-demo.component';
import { EventSignalPageComponent } from './demos/event-signal/event-signal-page.component';

/** What type of signals are returned from signal factory functions. */
export type UsageType = 'generator' | 'utility' | 'writableSignal';

export interface DemoConfigurationItem<FnName extends string> {
  readonly homeDemo: Type<unknown>;
  /** The url to the docs from the root. */
  readonly docUrl: string;
  /** Function name to generate signal.  Acts as distinct key. */
  readonly fnName: FnName;
  /** Display name */
  readonly name: string;
  readonly page: Type<unknown>;
  /** The route from the root of the app. */
  readonly route: string;
  /** The partial url from the lib folder to link to source in github. */
  readonly sourceUrl: string;
  readonly usages: UsageType[];
}

export const DEMO_CONFIGURATIONS = [
  {
    homeDemo: AsyncSignalHomeDemoComponent,
    docUrl: './api/functions/asyncSignal-1.html',
    fnName: 'asyncSignal' as const,
    name: 'asyncSignal',
    page: AsyncSignalPageComponent,
    route: 'async-signal',
    sourceUrl: 'signals/async-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: DebounceSignalHomeDemoComponent,
    docUrl: './api/functions/debounceSignal.html',
    fnName: 'debounceSignal' as const,
    name: 'debounceSignal',
    page: DebounceSignalPageComponent,
    route: 'debounce-signal',
    sourceUrl: 'signals/debounce-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: EventSignalHomeDemoComponent,
    docUrl: './api/functions/eventSignal.html',
    fnName: 'eventSignal' as const,
    name: 'eventSignal',
    page: EventSignalPageComponent,
    route: 'event-signal',
    sourceUrl: 'signals/event-signal.ts',
    usages: ['generator']
  },
  {
    homeDemo: ExtendSignalHomeDemoComponent,
    docUrl: './api/functions/extendSignal.html',
    fnName: 'extendSignal' as const,
    name: 'extendSignal',
    page: ExtendSignalPageComponent,
    route: 'extend-signal',
    sourceUrl: 'signals/extends-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: FilterSignalHomeDemoComponent,
    docUrl: './api/functions/filterSignal-1.html',
    fnName: 'filterSignal' as const,
    name: 'filterSignal',
    page: FilterSignalPageComponent,
    route: 'filter-signal',
    sourceUrl: 'signals/filter-signal.ts',
    usages: ['writableSignal']
  },
  {
    homeDemo: IntersectionSignalHomeDemoComponent,
    docUrl: './api/functions/intersectionSignal-1.html',
    fnName: 'intersectionSignal' as const,
    name: 'intersectionSignal',
    page: IntersectionSignalPageComponent,
    route: 'intersection-signal',
    sourceUrl: 'signals/dom-observers/intersection-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: LiftSignalHomeDemoComponent,
    docUrl: './api/functions/liftSignal.html',
    fnName: 'liftSignal' as const,
    name: 'liftSignal',
    page: LiftSignalPageComponent,
    route: 'lift-signal',
    sourceUrl: 'signals/lift-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: MapSignalHomeDemoComponent,
    docUrl: './api/functions/mapSignal-1.html',
    fnName: 'mapSignal' as const,
    name: 'mapSignal',
    page: MapSignalPageComponent,
    route: 'map-signal',
    sourceUrl: 'signals/map-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: MutationSignalHomeDemoComponent,
    docUrl: './api/functions/mutationSignal-1.html',
    fnName: 'mutationSignal' as const,
    name: 'mutationSignal',
    page: MutationSignalPageComponent,
    route: 'mutation-signal',
    sourceUrl: 'signals/dom-observers/mutation-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: ReduceSignalHomeDemoComponent,
    docUrl: './api/functions/reduceSignal-1.html',
    fnName: 'reduceSignal' as const,
    name: 'reduceSignal',
    page: ReduceSignalPageComponent,
    route: 'reduce-signal',
    sourceUrl: 'signals/reduce-signal.ts',
    usages: ['writableSignal']
  },
  {
    homeDemo: ResizeSignalHomeDemoComponent,
    docUrl: './api/functions/resizeSignal-1.html',
    fnName: 'resizeSignal' as const,
    name: 'resizeSignal',
    page: ResizeSignalPageComponent,
    route: 'resize-signal',
    sourceUrl: 'signals/dom-observers/resize-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: SequenceSignalHomeDemoComponent,
    docUrl: './api/functions/sequenceSignal-1.html',
    fnName: 'sequenceSignal' as const,
    name: 'sequenceSignal',
    page: SequenceSignalPageComponent,
    route: 'sequence-signal',
    sourceUrl: 'signals/sequence-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: SignalToIteratorHomeDemoComponent,
    docUrl: './api/functions/signalToIterator.html',
    fnName: 'signalToIterator' as const,
    name: 'signalToIterator',
    page: SignalToIteratorPageComponent,
    route: 'signal-to-iterator',
    sourceUrl: 'utilities/signal-to-iterator.ts',
    usages: ['utility']
  },
  {
    homeDemo: StorageSignalHomeDemoComponent,
    docUrl: './api/functions/storageSignal.html',
    fnName: 'storageSignal' as const,
    name: 'storageSignal',
    page: StorageSignalPageComponent,
    route: 'storage-signal',
    sourceUrl: 'signals/storage-signal.ts',
    usages: ['writableSignal']
  },
  {
    homeDemo: TimerSignalHomeDemoComponent,
    docUrl: './api/functions/timerSignal-1.html',
    fnName: 'timerSignal' as const,
    name: 'timerSignal',
    page: TimerSignalPageComponent,
    route: 'timer-signal',
    sourceUrl: 'signals/timer-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: TweenSignalHomeDemoComponent,
    docUrl: './api/functions/tweenSignal-1.html',
    fnName: 'tweenSignal' as const,
    name: 'tweenSignal',
    page: TweenSignalPageComponent,
    route: 'tween-signal',
    sourceUrl: 'signals/tween-signal.ts',
    usages: ['generator', 'writableSignal']
  }
] satisfies DemoConfigurationItem<string>[];

export type SignalFunctionName = (typeof DEMO_CONFIGURATIONS)[number]['fnName'];

export const DEMO_CONFIG_MAP = DEMO_CONFIGURATIONS.reduce(
  (prior, cur) => ({ ...prior, [cur.fnName]: cur }),
  {} as Record<SignalFunctionName, DemoConfigurationItem<SignalFunctionName>>
);
