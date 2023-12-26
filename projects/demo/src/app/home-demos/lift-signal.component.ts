import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  selector: 'app-lift-signal',
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="liftSignal">
  <div>
    "Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.
  </div>
  <div class="divider">Example</div>
  <app-example-code><pre>
const liftedArray = liftSignal([1, 2, 3], null, ['push']);
liftedArray.push(4)
console.log(liftedArray()); // [1, 2, 3, 4];
</pre></app-example-code>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiftSignalComponent {

}
