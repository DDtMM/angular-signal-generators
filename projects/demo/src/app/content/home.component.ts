import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_CONFIGURATIONS, DemoConfigurationItem } from '../demo-configuration';



@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterLink],
    template: `
<div class="hero bg-gradient-to-br from-base-200 via-base-100 to-primary from-[-20%] via-[80%] to-[320%] ">
  <div class="hero-content text-center md:p-6 w-full">
    <div class="max-w-lg">
      <div class="flex justify-center">
        <img src="assets/angular-signal-generators-logo.png" alt="Angular Signal Generators Logo"
          class="h-24 w-24 sm:h-32 sm:w-32 self-center drop-shadow-xl" />
        <h1 class="shrink inline text-4xl sm:text-5xl font-bold text-left">
          Angular Signal Generators
        </h1>
      </div>

      <p class="py-6">
        Streamline your Angular development with Angular Signal Generators,
        a library of signals and utilities designed to replace common patterns <span class="inline-block">for faster, cleaner code.</span>
      </p>
      <button class="btn btn-primary" routerLink="/getting-started">Get Started</button>
    </div>
  </div>
</div>

<div class="divider"></div>
<h2 class="text-3xl text-center">Function Demos</h2>
<ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
  @for (d of demos; track d.fnName) {
    @if (!d.isExcludedFromHomePage) {
      <ng-container *ngComponentOutlet="d.homeDemo" class="contents" />
    }
  }
</ul>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly demos: DemoConfigurationItem<string>[] = DEMO_CONFIGURATIONS;
}
