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
import { HomeComponent } from './home.component';
import { GettingStartedComponent } from './content/getting-started.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'getting-started', component: GettingStartedComponent },
  // demos
  { path: 'async-signal', component: AsyncSignalPageComponent },
  { path: 'debounce-signal', component: DebounceSignalPageComponent },
  { path: 'extend-signal', component: ExtendSignalPageComponent },
  { path: 'filter-signal', component: FilterSignalPageComponent },
  { path: 'lift-signal', component: LiftSignalPageComponent },
  { path: 'map-signal', component: MapSignalPageComponent },
  { path: 'reduce-signal', component: ReduceSignalPageComponent },
  { path: 'signal-to-iterator', component: SignalToIteratorPageComponent },
  { path: 'sequence-signal', component: SequenceSignalPageComponent },
  { path: 'timer-signal', component: TimerSignalPageComponent },
  { path: 'tween-signal', component: TweenSignalPageComponent },
  // redirect
  { path: '**', redirectTo: '' }
];
