import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
    imports: [ExampleCodeComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="inspect">
  <div>
    Outputs any changes to deeply nested signals.
  </div>
  <div class="divider">Example</div>
  <app-example-code><pre>
$age = signal(21);
$name = signal('Danny');
inspect({{'{'}} age: $age, name: $name {{'}'}}); // [LOG]: {{'{'}} age: 21, name: 'Danny' {{'}'}}
$age.set(102); // [LOG]: {{'{'}} age: 102, name: 'Danny' {{'}'}}
</pre></app-example-code>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectHomeDemoComponent {}
