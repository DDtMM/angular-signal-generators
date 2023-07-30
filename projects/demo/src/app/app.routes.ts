import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { TimerSignalComponent } from './signal-generators/timer-signal.component';
import { DebounceSignalComponent } from './signal-generators/debounce-signal.component';
import { SequenceSignalComponent } from './signal-generators/sequence-signal.component';
import { MapSignalComponent } from './signal-generators/map-signal.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'debounce-signal', component: DebounceSignalComponent },
  { path: 'map-signal', component: MapSignalComponent },
  { path: 'sequence-signal', component: SequenceSignalComponent },
  { path: 'timer-signal', component: TimerSignalComponent },
  { path: '**', redirectTo: '' }
];
