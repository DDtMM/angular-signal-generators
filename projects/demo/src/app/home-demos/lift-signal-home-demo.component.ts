import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="liftSignal">
  <div>
    "Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
const liftedArray = liftSignal([1, 2, 3], null, ['push']);
liftedArray.push(4)
console.log(liftedArray()); // [1, 2, 3, 4];
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiftSignalHomeDemoComponent {

}
