import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
<nav class="flex items-center justify-between flex-wrap bg-blue-500 py-5 px-3">
  <div class="flex items-center flex-shrink-0 text-white mr-6">
    <span class="font-semibold text-xl tracking-tight">Angular Signal Generators</span>
  </div>
</nav>
<div class="p-3">
  <router-outlet></router-outlet>
</div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'demo';
}
