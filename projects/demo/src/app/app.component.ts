import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, RouterOutlet],
  template: `
<nav class="navbar bg-primary">
  <div class="navbar-start md:hidden">
    <div class="dropdown">
      <label tabindex="0" class="btn btn-primary ">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </label>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
        <li><a href="./api">API Docs</a></li>
        <li>
          <a href="https://github.com/DDtMM/angular-signal-generators">
            <fa-icon [icon]="faGithub" />Github
          </a>
        </li>
      </ul>
    </div>
    <a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" [routerLink]="['/']">Angular Signal Generators</a>
  </div>
  <div class="navbar-start hidden md:block">
    <ul class="menu menu-horizontal flex-nowrap py-0 px-1">
      <li><a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" [routerLink]="['/']">Angular Signal Generators</a></li>
      <li><a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" href="./api">API Docs</a></li>
      <li><a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" href="https://github.com/DDtMM/angular-signal-generators">
        <fa-icon [icon]="faGithub" />
        Github
      </a></li>
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
}
