import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { mediaQuerySignal } from '@ddtmm/angular-signal-generators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faMedium, faStackOverflow } from '@fortawesome/free-brands-svg-icons';
import { DEMO_CONFIGURATIONS } from './demo-configuration';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FontAwesomeModule, RouterLink, RouterLinkActive, RouterOutlet],
    template: `

  <nav class="navbar bg-primary sticky top-0 z-40 bg-opacity-90 backdrop-blur drawer drawer-end">
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
    <div class="flex-none md:hidden">
      <input id="app-nav-drawer-toggle" type="checkbox" class="drawer-toggle" #appNavDrawerToggle />
      <div class="drawer-content">
        <label for="app-nav-drawer-toggle" aria-label="Open Navigation" tabindex="0" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>
      <div class="drawer-side">
        <label for="app-nav-drawer-toggle" aria-label="Close Navigation" class="drawer-overlay"></label>
        <ul tabindex="0" class="menu menu-sm min-h-full bg-base-200 w-52">
          <li><a routerLink="/" (click)="closeDrawer()">Home</a></li>
          <li><a routerLink="/getting-started" (click)="closeDrawer()">Getting Started</a></li>
          <li><a href="./api/index.html" (click)="closeDrawer()">API Docs</a></li>
          <li>
            <a href="https://github.com/DDtMM/angular-signal-generators" (click)="closeDrawer()">
              <fa-icon [icon]="faGithub" />Github
            </a>
          </li>
          <ng-container *ngTemplateOutlet="demosMenuItems" />
        </ul>
      </div>
    </div>
  </nav>
  <div class="w-64 mt-16 top-0 bottom-0 fixed overflow-y-auto y menu menu-sm py-3 bg-base border-base-300 border-r  hidden md:flex">
    <ul>
      <ng-container *ngTemplateOutlet="demosMenuItems" />
    </ul>
  </div>
  <ng-template #demosMenuItems>
    <li class="">
      <a class="menu-title">Signal Factories</a>
      <ul>
        @for (l of signalFactories; track l) {
          <li>
            <a [routerLink]="l.route" routerLinkActive="active" (click)="closeDrawer()">{{l.name}}</a>
          </li>
        }
      </ul>
    </li>
    <li class="">
      <a class="menu-title">Utilities</a>
      <ul>
        @for (l of utilities; track l) {
          <li>
            <a [routerLink]="l.route" routerLinkActive="active" (click)="closeDrawer()">{{l.name}}</a>
          </li>
        }
      </ul>
    </li>
  </ng-template>
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
  readonly $drawerToggle = viewChild.required<ElementRef<HTMLInputElement>>('appNavDrawerToggle');
  readonly faGithub = faGithub;
  readonly faLinkedin = faLinkedin;
  readonly faMedium = faMedium;
  readonly faStackOverflow = faStackOverflow;
  readonly demos = DEMO_CONFIGURATIONS;
  readonly signalFactories = DEMO_CONFIGURATIONS.filter(x => x.usages.some(x => x === 'generator' || x === 'writableSignal'))
  readonly utilities = DEMO_CONFIGURATIONS.filter(x => x.usages.some(x => x === 'utility'));


  constructor() {
    // dark mode is initially set by a script on the index.html page, but this will respond to any changes.
    const rootElem = inject(DOCUMENT).documentElement;
    const $prefersDark = mediaQuerySignal(`(prefers-color-scheme: dark)`);
    effect(() => rootElem.setAttribute('data-theme', $prefersDark().matches ? 'night' : 'garden'));
  }

  closeDrawer() {
    this.$drawerToggle().nativeElement.checked = false;
  }
}
