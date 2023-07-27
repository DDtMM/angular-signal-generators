import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ScratchpadComponent } from './scratchpad.component';
import { TimerSignalComponent } from './signal-generators/timer-signal.component';
import { DebounceSignalComponent } from './signal-generators/debounce-signal.component';
import { SequenceSignalComponent } from './signal-generators/sequence-signal.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'debounce-signal', component: DebounceSignalComponent },
  { path: 'sequence-signal', component: SequenceSignalComponent },
  { path: 'scratchpad', component: ScratchpadComponent },
  { path: 'timer-signal', component: TimerSignalComponent },

];
