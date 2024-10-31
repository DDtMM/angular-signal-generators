import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { CopyButtonComponent } from '../controls/copy-button.component';

@Component({
    selector: 'app-getting-started',
    imports: [CopyButtonComponent, HighlightModule],
    template: `
<div>
  <div class="doc-header">
    <h1>Getting Started</h1>
  </div>
  <h2>Installation</h2>
  <p>
    Angular Signal Generators are compatible with Angular 16 and 17.
    You can install it from npm by running the following:

  </p>
  <div class="relative">
    <span class="absolute right-0 p-1">
      <app-copy-button [content]="installCode.innerText"></app-copy-button>
    </span>
    <code class="bg-slate-50 p-3 my-2 shadow-sm" #installCode>
      npm install &#64;ddtmm/angular-signal-generators
    </code>
  </div>
  <div class="divider"></div>
  <h2>Versions</h2>
  <p>The following is a table of compatibility for library versions with respect to Angular versions:</p>
  <table class="table">
    <thead><tr>
      <td>Library</td>
      <td>Angular</td>
    </tr>
    </thead>
    <tbody>
      <tr><td>2.x.x</td><td>&gt;=17.0.0 ^18.0.0</td></tr>
      <tr><td>1.x.x</td><td>&gt;=16.0.0 ^17.0.0</td></tr>
</tbody>
  </table>
  <div class="divider"></div>
  <h2>Usage</h2>
  <p>
    Most can be either used in a similar fashion to a writable signal, or be passed a reference to an existing signal to generate new values.
    To include them in your project, just import them as needed from <b>&#64;ddtmm/angular-signal-generators</b>:
  </p>

  <div class="border-base-300 bg-slate-50 whitespace-pre-wrap w-full overflow-clip shadow-sm">
    <code class="h-full w-full bg-slate-50 " [highlight]="source" language="typescript"></code>
  </div>
  <div class="divider"></div>
  <p>
    To learn more about how these signals are created, or some dos or don'ts when creating your own,
    please check out the following articles:
  </p>
  <ul class="list-inside list-disc indent-2">
    <li>
      <a href="https://blog.stackademic.com/crafting-custom-angular-signals-7ef83b2e751f" class="link italic">
        Crafting Custom Angular Signals
      </a>
    </li>
    <li>
      <a href="https://blog.stackademic.com/experiments-in-angular-signals-six-techniques-that-sizzle-or-fizzle-119692b451ab"
        class="link italic">
        Experiments in Angular Signals: Six Techniques that Sizzle or Fizzle
      </a>
    </li>
  </ul>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GettingStartedComponent {

  readonly source = `
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from '@ddtmm/angular-signal-generators';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: \`
    <input [(ngModel)]="$debounced" />
    <div>{{$debounced()}}</div>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  readonly $debounced = debounceSignal('', 500);
}
`.trim();
}
