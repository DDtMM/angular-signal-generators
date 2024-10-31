import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
    imports: [FormsModule, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
  <app-home-box fnName="sequenceSignal">
    <div>
      The Sequence Signal is useful for situations where you want to easily cycle between options.
    </div>
    <div class="divider">Example</div>
    <div class="flex flex-row gap-3">
      <div class="flex flex-col gap-1">
        <div class="flex flex-row items-center gap-3">
          <input type="radio" class="radio checked:bg-blue-500" value="a" [ngModel]="sequenceChoices()" /> Choice A
        </div>
        <div class="flex flex-row items-center gap-3">
          <input type="radio" class="radio checked:bg-blue-500" value="b" [ngModel]="sequenceChoices()" /> Choice B
        </div>
        <div class="flex flex-row items-center gap-3">
          <input type="radio" class="radio checked:bg-blue-500" value="c" [ngModel]="sequenceChoices()" /> Choice C
        </div>
      </div>
      <button type="button" class="btn btn-primary" (click)="sequenceChoices.next()">Next Choice</button>
    </div>
  </app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SequenceSignalHomeDemoComponent {
  readonly sequenceChoices = sequenceSignal(['a', 'b', 'c']);
}
