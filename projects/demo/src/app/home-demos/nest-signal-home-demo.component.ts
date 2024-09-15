import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="nestSignal">
  <div>
    Takes a value that contains one or more nested signals and emits their resolved values.
  </div>
  <div class="divider">Example</div>
  <app-example-code><pre>
$age = signal(21);
$name = signal('Danny');
$nest = nestSignal({{'{'}} age: $age, name: $name {{'}'}});
console.log($nest()); // [LOG]: {{'{'}} age: 21, name: 'Danny' {{'}'}}
</pre></app-example-code>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestSignalHomeDemoComponent {}
