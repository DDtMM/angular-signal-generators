import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { TimerSignalComponent } from './signal-generators/timer-signal.component';
import { DebounceSignalComponent } from './signal-generators/debounce-signal.component';
import { SequenceSignalComponent } from './signal-generators/sequence-signal.component';
import { MapSignalComponent } from './signal-generators/map-signal.component';
import { LiftSignalComponent } from './signal-generators/lift-signal.component';
import { ExtendSignalComponent } from './signal-generators/extend-signal.component';
import { TweenSignalComponent } from './signal-generators/tween-signal.component';
import { FilterSignalComponent } from './signal-generators/filter-signal.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'debounce-signal', component: DebounceSignalComponent },
  { path: 'extend-signal', component: ExtendSignalComponent },
  { path: 'filter-signal', component: FilterSignalComponent },
  { path: 'lift-signal', component: LiftSignalComponent },
  { path: 'map-signal', component: MapSignalComponent },
  { path: 'sequence-signal', component: SequenceSignalComponent },
  { path: 'timer-signal', component: TimerSignalComponent },
  { path: 'tween-signal', component: TweenSignalComponent },
  { path: '**', redirectTo: '' }
];
