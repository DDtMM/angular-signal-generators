import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faMedium, faStackOverflow } from '@fortawesome/free-brands-svg-icons';
import { DEMO_CONFIGURATIONS } from './demo-configuration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `

  <nav class="navbar bg-primary sticky top-0 z-40 bg-opacity-90 backdrop-blur">
    <div class="flex-1">
      <ul class="menu menu-horizontal font-semibold text-lg tracking-tight normal-case  flex-nowrap py-0 px-1">
        <li>
          <a class="text-primary-content pl-1" [routerLink]="['/']">
            <img src="assets/angular-signal-generators-logo.png" alt="Angular Signal Generators Logo" class="h-7 w-7 -my-2" />
            Angular Signal Generators
          </a>
        </li>
        <li><a class="text-primary-content hidden md:grid" routerLink="/getting-started">Getting Started</a></li>
        <li><a class="text-primary-content hidden md:grid" href="./api/index.html">API Docs</a></li>
        <li>
          <a class="text-primary-content hidden md:grid" href="https://github.com/DDtMM/angular-signal-generators">
            <fa-icon [icon]="faGithub" />
              Github
          </a>
        </li>
      </ul>
    </div>
    <div class="dropdown dropdown-end flex-none">
      <label tabindex="0" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </label>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
        <li><a routerLink="/getting-started">Getting Started</a></li>
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
  <div class="w-64 mt-16 top-0 bottom-0 fixed overflow-y-auto y menu menu-sm py-3  bg-base border-base-300 border-r  hidden md:flex">
    <ul>
      <li><a routerLink="getting-started" routerLinkActive="active">Getting Started</a></li>
      <li class="">
        <a class="menu-title">Functions</a>
        <ul>
          @for (l of demos; track l) {
            <li>
              <a [routerLink]="l.route" routerLinkActive="active">{{l.name}}</a>
            </li>
          }
        </ul>
      </li>
    </ul>
  </div>


  <div class="pl-0 md:pl-64 w-full min-h-screen -mt-16 pt-16 flex flex-col">
    <div class="p-3 mb-6">
      <router-outlet></router-outlet>
    </div>
    <footer class="mt-auto footer p-8 bg-neutral text-neutral-content">
      <nav>
        <div class="font-semibold">Angular Signal Generators was created by Danny Gimenez</div>
        <a class="link link-hover" href="https://github.com/DDtMM/"><fa-icon [icon]="faGithub" [fixedWidth]="true" /> Github</a>
        <a class="link link-hover" href="https://www.linkedin.com/in/dangimenez"><fa-icon [icon]="faLinkedin" [fixedWidth]="true"/> LinkedIn</a>
        <a class="link link-hover" href="https://medium.com/@ddtmm"><fa-icon [icon]="faMedium"[fixedWidth]="true" /> Medium</a>
        <a class="link link-hover" href="https://stackoverflow.com/users/2497335/daniel-gimenez"><fa-icon [icon]="faStackOverflow" [fixedWidth]="true"/>  Stack Overflow</a>
      </nav>
    </footer>
  </div>
  `
})
export class AppComponent {
  readonly faGithub = faGithub;
  readonly faLinkedin = faLinkedin;
  readonly faMedium = faMedium;
  readonly faStackOverflow = faStackOverflow;
  readonly demos = DEMO_CONFIGURATIONS;
}
