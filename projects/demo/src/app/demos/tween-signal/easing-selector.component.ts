import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EASING_NAMES, EasingName } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-easing-selector',
  standalone: true,
  imports: [FormsModule],
  template: `
  <select class="select select-primary select-sm" [ngModel]="$easingFn()" (ngModelChange)="$easingFn.set($event)">
    @for (easing of easingNames; track easing) {
      <option [value]="easing">{{easing}}</option>
    }
  </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EasingSelectorComponent {
  readonly easingNames = EASING_NAMES;
  readonly $easingFn = model<EasingName>('easeInBack',{ alias: 'easingFn'})
}
