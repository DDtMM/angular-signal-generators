import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [HomeBoxComponent, ExampleCodeComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="extendSignal">
      <div>Adds new methods to an existing signal.</div>
      <div class="divider">Example</div>
      <app-example-code>
        <pre>
const calculator = extendSignal(5, &lbrace;
  multiply: (s, multi) => s.update(x => x * multi);
&rbrace;);
calculator.multiply(3);
console.log(calculator()); // 15;
        </pre>
      </app-example-code>
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendSignalHomeDemoComponent { }
