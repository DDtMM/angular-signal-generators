import { Type } from '@angular/core';
import { AsyncSignalHomeDemoComponent } from './home-demos/async-signal-home-demo.component';
import { DebounceSignalHomeDemoComponent } from './home-demos/debounce-signal-home-demo.component';
import { EventSignalHomeDemoComponent } from './home-demos/event-signal-home-demo.component';
import { FilterSignalHomeDemoComponent } from './home-demos/filter-signal-home-demo.component';
import { InspectHomeDemoComponent } from './home-demos/inspect-home-demo.component';
import { IntersectionSignalHomeDemoComponent } from './home-demos/intersection-signal-home-demo.component';
import { LiftSignalHomeDemoComponent } from './home-demos/lift-signal-home-demo.component';
import { MapSignalHomeDemoComponent } from './home-demos/map-signal-home-demo.component';
import { MediaQuerySignalHomeDemoComponent } from './home-demos/media-query-signal-home-demo.component';
import { MutationSignalHomeDemoComponent } from './home-demos/mutation-signal-home-demo.component';
import { NestSignalHomeDemoComponent } from './home-demos/nest-signal-home-demo.component';
import { ReduceSignalHomeDemoComponent } from './home-demos/reduce-signal-home-demo.component';
import { ResizeSignalHomeDemoComponent } from './home-demos/resize-signal-home-demo.component';
import { SequenceSignalHomeDemoComponent } from './home-demos/sequence-signal-home-demo.component';
import { SignalToIteratorHomeDemoComponent } from './home-demos/signal-to-iterator-home-demo.component';
import { SpringSignalHomeDemoComponent } from './home-demos/spring-signal-home-demo.component';
import { StorageSignalHomeDemoComponent } from './home-demos/storage-signal-home-demo.component';
import { TimerSignalHomeDemoComponent } from './home-demos/timer-signal-home-demo.component';
import { TweenSignalHomeDemoComponent } from './home-demos/tween-signal-home-demo.component';

/** What type of signals are returned from signal factory functions. */
export type UsageType = 'generator' | 'obsolete' | 'utility' | 'writableSignal';

export interface DemoConfigurationItem<FnName extends string> {
  /** The home demo component type. */
  readonly homeDemo: Type<unknown>;
  /** The url to the docs from the root. */
  readonly docUrl: string;
  /** Function name to generate signal.  Acts as distinct key. */
  readonly fnName: FnName;
  /** If true, then omit then don't show this on the home page demos. */
  readonly isExcludedFromHomePage?: boolean;
  /** Display name */
  readonly name: string;
  /** The lazily demo page component type.  */
  readonly page: () => Promise<Type<unknown>>;
  /** The route from the root of the app. */
  readonly route: string;
  /** The partial url from the lib folder to link to source in github. */
  readonly sourceUrl: string;
  readonly usages: UsageType[];
}
const DOC_URL_PREFIX = './api/functions/_ddtmm_angular_signal_generators.';

export const DUMMY_CONFIGURATION: DemoConfigurationItem<string> = {
  homeDemo: AsyncSignalHomeDemoComponent,
  docUrl: `${DOC_URL_PREFIX}dummy.html`,
  fnName: 'dummy' as const,
  name: 'dummy',
  page: () => import('./content/signal-factories/dummy-page.component').then(x => x.DummyPageComponent),
  route: 'dummy',
  sourceUrl: 'dummy.ts',
  usages: ['generator', 'writableSignal', 'utility']
};

export const DEMO_CONFIGURATIONS = [
  {
    homeDemo: AsyncSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}asyncSignal-1.html`,
    fnName: 'asyncSignal' as const,
    name: 'asyncSignal',
    page: () => import('./content/signal-factories/async-signal-page.component').then(x => x.AsyncSignalPageComponent),
    route: 'async-signal',
    sourceUrl: 'signals/async-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: DebounceSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}debounceSignal.html`,
    fnName: 'debounceSignal' as const,
    name: 'debounceSignal',
    page: () => import('./content/signal-factories/debounce-signal-page.component').then(x => x.DebounceSignalPageComponent),
    route: 'debounce-signal',
    sourceUrl: 'signals/debounce-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: EventSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}eventSignal.html`,
    fnName: 'eventSignal' as const,
    name: 'eventSignal',
    page: () => import('./content/signal-factories/event-signal-page.component').then(x => x.EventSignalPageComponent),
    route: 'event-signal',
    sourceUrl: 'signals/event-signal.ts',
    usages: ['generator']
  },
  {
    homeDemo: FilterSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}filterSignal-1.html`,
    fnName: 'filterSignal' as const,
    name: 'filterSignal',
    page: () => import('./content/signal-factories/filter-signal-page.component').then(x => x.FilterSignalPageComponent),
    route: 'filter-signal',
    sourceUrl: 'signals/filter-signal.ts',
    usages: ['writableSignal']
  },
  {
    homeDemo: InspectHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}inspect.html`,
    fnName: 'inspect' as const,
    name: 'inspect',
    page: () => import('./content/signal-utilities/inspect-page.component').then(x => x.InspectPageComponent),
    route: 'inspect',
    sourceUrl: 'utilities/inspect.ts',
    usages: ['utility']
  },
  {
    homeDemo: IntersectionSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}intersectionSignal-1.html`,
    fnName: 'intersectionSignal' as const,
    name: 'intersectionSignal',
    page: () => import('./content/signal-factories/intersection-signal-page.component').then(x => x.IntersectionSignalPageComponent),
    route: 'intersection-signal',
    sourceUrl: 'signals/dom-observers/intersection-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: LiftSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}liftSignal.html`,
    fnName: 'liftSignal' as const,
    name: 'liftSignal',
    page: () => import('./content/signal-factories/lift-signal-page.component').then(x => x.LiftSignalPageComponent),
    route: 'lift-signal',
    sourceUrl: 'signals/lift-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: MapSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}mapSignal-1.html`,
    fnName: 'mapSignal' as const,
    name: 'mapSignal',
    page: () => import('./content/signal-factories/map-signal-page.component').then(x => x.MapSignalPageComponent),
    route: 'map-signal',
    sourceUrl: 'signals/map-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: MediaQuerySignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}mediaQuerySignal-1.html`,
    fnName: 'mediaQuerySignal' as const,
    name: 'mediaQuerySignal',
    page: () => import('./content/signal-factories/media-query-signal-page.component').then(x => x.MediaQuerySignalPageComponent),
    route: 'media-query-signal',
    sourceUrl: 'signals/media-query-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: MutationSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}mutationSignal-1.html`,
    fnName: 'mutationSignal' as const,
    name: 'mutationSignal',
    page: () => import('./content/signal-factories/mutation-signal-page.component').then(x => x.MutationSignalPageComponent),
    route: 'mutation-signal',
    sourceUrl: 'signals/dom-observers/mutation-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: NestSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}nestSignal.html`,
    fnName: 'nestSignal' as const,
    name: 'nestSignal',
    page: () => import('./content/signal-factories/nest-signal-page.component').then(x => x.NestSignalPageComponent),
    route: 'nest-signal',
    sourceUrl: 'signals/nest-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: ReduceSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}reduceSignal-1.html`,
    fnName: 'reduceSignal' as const,
    name: 'reduceSignal',
    page: () => import('./content/signal-factories/reduce-signal-page.component').then(x => x.ReduceSignalPageComponent),
    route: 'reduce-signal',
    sourceUrl: 'signals/reduce-signal.ts',
    usages: ['writableSignal']
  },
  {
    homeDemo: ResizeSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}resizeSignal-1.html`,
    fnName: 'resizeSignal' as const,
    name: 'resizeSignal',
    page: () => import('./content/signal-factories/resize-signal-page.component').then(x => x.ResizeSignalPageComponent),
    route: 'resize-signal',
    sourceUrl: 'signals/dom-observers/resize-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: SpringSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}springSignal-1.html`,
    fnName: 'springSignal' as const,
    name: 'springSignal',
    page: () => import('./content/signal-factories/spring-signal-page.component').then(x => x.SpringSignalPageComponent),
    route: 'spring-signal',
    sourceUrl: 'signals/dom-observers/spring-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: SequenceSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}sequenceSignal-1.html`,
    fnName: 'sequenceSignal' as const,
    name: 'sequenceSignal',
    page: () => import('./content/signal-factories/sequence-signal-page.component').then(x => x.SequenceSignalPageComponent),
    route: 'sequence-signal',
    sourceUrl: 'signals/sequence-signal.ts',
    usages: ['generator', 'writableSignal']
  },
  {
    homeDemo: SignalToIteratorHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}signalToIterator.html`,
    fnName: 'signalToIterator' as const,
    name: 'signalToIterator',
    page: () => import('./content/signal-utilities/signal-to-iterator-page.component').then(x => x.SignalToIteratorPageComponent),
    route: 'signal-to-iterator',
    sourceUrl: 'utilities/signal-to-iterator.ts',
    usages: ['utility']
  },
  {
    homeDemo: StorageSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}storageSignal.html`,
    fnName: 'storageSignal' as const,
    name: 'storageSignal',
    page: () => import('./content/signal-factories/storage-signal-page.component').then(x => x.StorageSignalPageComponent),
    route: 'storage-signal',
    sourceUrl: 'signals/storage-signal.ts',
    usages: ['writableSignal']
  },
  {
    homeDemo: TimerSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}timerSignal-1.html`,
    fnName: 'timerSignal' as const,
    name: 'timerSignal',
    page: () => import('./content/signal-factories/timer-signal-page.component').then(x => x.TimerSignalPageComponent),
    route: 'timer-signal',
    sourceUrl: 'signals/timer-signal.ts',
    usages: ['generator', 'writableSignal'],
  },
  {
    homeDemo: TweenSignalHomeDemoComponent,
    docUrl: `${DOC_URL_PREFIX}tweenSignal-1.html`,
    fnName: 'tweenSignal' as const,
    name: 'tweenSignal',
    page: () => import('./content/signal-factories/tween-signal-page.component').then(x => x.TweenSignalPageComponent),
    route: 'tween-signal',
    sourceUrl: 'signals/tween-signal.ts',
    usages: ['generator', 'writableSignal']
  }
] satisfies DemoConfigurationItem<string>[];

export type SignalFunctionName = (typeof DEMO_CONFIGURATIONS)[number]['fnName'] | 'dummy';

export const DEMO_CONFIG_MAP = DEMO_CONFIGURATIONS.reduce(
  (prior, cur) => ({ ...prior, [cur.fnName]: cur }),
  {} as Record<SignalFunctionName, DemoConfigurationItem<SignalFunctionName>>
);
