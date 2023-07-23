import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
<nav class="navbar bg-primary">
  <a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" [routerLink]="['/']">Angular Signal Generators</a>
</nav>
<div class="p-4">
  <router-outlet></router-outlet>
</div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'demo';
}
