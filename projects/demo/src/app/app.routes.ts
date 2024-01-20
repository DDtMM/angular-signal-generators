import { Routes } from '@angular/router';
import { DebounceSignalComponent } from './demos/debounce-signal.component';
import { ExtendSignalComponent } from './demos/extend-signal.component';
import { FilterSignalComponent } from './demos/filter-signal.component';
import { LiftSignalComponent } from './demos/lift-signal.component';
import { MapSignalComponent } from './demos/map-signal.component';
import { ReduceSignalComponent } from './demos/reduce-signal.component';
import { SequenceSignalComponent } from './demos/sequence-signal.component';
import { SignalToIteratorComponent } from './demos/signal-to-iterator.component';
import { TimerSignalComponent } from './demos/timer-signal.component';
import { TweenSignalComponent } from './demos/tween-signal.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'debounce-signal', component: DebounceSignalComponent },
  { path: 'extend-signal', component: ExtendSignalComponent },
  { path: 'filter-signal', component: FilterSignalComponent },
  { path: 'lift-signal', component: LiftSignalComponent },
  { path: 'map-signal', component: MapSignalComponent },
  { path: 'reduce-signal', component: ReduceSignalComponent },
  { path: 'signal-to-iterator', component: SignalToIteratorComponent },
  { path: 'sequence-signal', component: SequenceSignalComponent },
  { path: 'timer-signal', component: TimerSignalComponent },
  { path: 'tween-signal', component: TweenSignalComponent },
  { path: '**', redirectTo: '' }
];
