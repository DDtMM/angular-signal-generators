import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from 'projects/signal-generators/src/public-api';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [FormsModule, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="debounceSignal">
    <div>
      Creates a signal whose value isn't changed until it a certain has passed since the last update.
    </div>
    <div class="divider">Example</div>
    <div class="flex flex-col gap-3">
      <div class="flex flex-row gap-3 items-baseline">
        <label>Input</label>
        <input type="text" class="input input-bordered input-sm grow" [ngModel]="debounced()" (ngModelChange)="debounced.set($event)" />
      </div>
      <div class="flex flex-row gap-3  leading-8">
        <span>Debounced</span>
        <span class="border border-solid border-secondary grow rounded-lg px-3 bg-base-100">{{debounced()}}</span>
      </div>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebounceSignalHomeDemoComponent {
  readonly debounced = debounceSignal('', 500);

}
