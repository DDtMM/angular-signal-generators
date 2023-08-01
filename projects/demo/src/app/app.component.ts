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
  <a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" [routerLink]="['/']">Angular Signal Generators</a>
  <a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" href="./api">API Docs</a>
  <a class="btn btn-primary font-semibold text-xl tracking-tight normal-case" href="https://github.com/DDtMM/angular-signal-generators">
    <fa-icon [icon]="faGithub" />
    Github
  </a>
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
