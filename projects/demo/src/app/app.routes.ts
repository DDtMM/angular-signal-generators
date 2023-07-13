import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { MergeSignalComponent } from './signal-generators/merge-signal.component';
import { ScratchpadComponent } from './scratchpad.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'merge-signal', component: MergeSignalComponent },
  { path: 'scratchpad', component: ScratchpadComponent }
];
