import { Routes } from '@angular/router';
import { GettingStartedComponent } from './content/getting-started.component';
import { HomeComponent } from './content/home.component';
import { DEMO_CONFIGURATIONS } from './demo-configuration';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'getting-started', component: GettingStartedComponent, title: 'Getting Started' },
  // demos
  ...DEMO_CONFIGURATIONS.map(x => ({ path: x.route, component: x.page, title: x.name })),
  // redirect
  { path: '**', redirectTo: '' }
];
