import { ChangeDetectionStrategy, Component } from '@angular/core';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ChoicesDemoComponent } from "../demos/sequence-signal/choices-demo/choices-demo.component";

@Component({
    imports: [ChoicesDemoComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
  <app-home-box fnName="sequenceSignal">
    <div>
      The Sequence Signal is useful for situations where you want to easily cycle between options.
    </div>
    <div class="divider">Example</div>
    <app-choices-demo />
  </app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SequenceSignalHomeDemoComponent {
  readonly sequenceChoices = sequenceSignal(['a', 'b', 'c']);
}
