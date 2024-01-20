import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { DEMO_CONFIGURATIONS } from './demo-configuration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, RouterOutlet],
  template: `
<nav class="navbar bg-primary">
  <div class="flex-1">
    <ul class="menu menu-horizontal flex-nowrap py-0 px-1">
      <li>
        <a class="btn btn-primary font-semibold text-xl tracking-tight normal-case pl-1" [routerLink]="['/']">
          <img src="assets/angular-signal-generators-logo.png" alt="Angular Signal Generators Logo" class="h-8 w-8 -my-2" />
          Angular Signal Generators
        </a>
      </li>
      <li><a class="btn btn-primary font-semibold text-xl tracking-tight normal-case hidden md:inline-block" href="./api/index.html">API Docs</a></li>
      <li><a class="btn btn-primary font-semibold text-xl tracking-tight normal-case hidden md:inline-block" href="https://github.com/DDtMM/angular-signal-generators">
        <fa-icon [icon]="faGithub" />
          Github
      </a></li>
    </ul>
  </div>
  <div class="dropdown dropdown-end flex-none">
    <label tabindex="0" class="btn btn-primary">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </label>
    <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
      <li><a href="./api/index.html">API Docs</a></li>
      <li>
        <a href="https://github.com/DDtMM/angular-signal-generators">
          <fa-icon [icon]="faGithub" />Github
        </a>
      </li>
      <li>
        <h2 class="menu-title">Functions</h2>
        <ul>
          @for (l of demos; track l) {
            <li>
              <a [routerLink]="l.route">{{l.name}}</a>
            </li>
          }
        </ul>
      </li>
    </ul>
  </div>
</nav>
<div class="p-4">
  <router-outlet></router-outlet>
</div>
  `,
  styles: [],
})
export class AppComponent {
  readonly faGithub = faGithub;

  readonly demos = DEMO_CONFIGURATIONS;
}
