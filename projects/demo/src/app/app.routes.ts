import { Routes } from '@angular/router';
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
import { HomeComponent } from './content/home.component';
import { GettingStartedComponent } from './content/getting-started.component';
import { StorageSignalPageComponent } from './demos/storage-signal/storage-signal-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'getting-started', component: GettingStartedComponent, title: 'Getting Started' },
  // demos
  { path: 'async-signal', component: AsyncSignalPageComponent, title: 'Async Signal' },
  { path: 'debounce-signal', component: DebounceSignalPageComponent, title: 'Debounce Signal' },
  { path: 'extend-signal', component: ExtendSignalPageComponent, title: 'Extend Signal' },
  { path: 'filter-signal', component: FilterSignalPageComponent, title: 'Filter Signal' },
  { path: 'lift-signal', component: LiftSignalPageComponent, title: 'Lift Signal' },
  { path: 'map-signal', component: MapSignalPageComponent, title: 'Map Signal' },
  { path: 'reduce-signal', component: ReduceSignalPageComponent, title: 'Reduce Signal' },
  { path: 'signal-to-iterator', component: SignalToIteratorPageComponent, title: 'Signal to Iterator' },
  { path: 'sequence-signal', component: SequenceSignalPageComponent, title: 'Sequence Signal' },
  { path: 'storage-signal', component: StorageSignalPageComponent, title: 'Storage Signal' },
  { path: 'timer-signal', component: TimerSignalPageComponent, title: 'Timer Signal' },
  { path: 'tween-signal', component: TweenSignalPageComponent, title: 'Tween Signal' },
  // redirect
  { path: '**', redirectTo: '' }
];
