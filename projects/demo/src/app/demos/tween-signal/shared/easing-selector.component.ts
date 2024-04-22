import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EasingFn, easeInBack, easings } from 'projects/signal-generators/src/public-api';

type EasingFnName = keyof typeof easings;

@Component({
  selector: 'app-easing-selector',
  standalone: true,
  imports: [FormsModule],
  template: `
  <select class="select select-primary select-sm" [ngModel]="$easingFnName()" (ngModelChange)="setEasingFn($event)">
    @for (easing of easingNames; track easing) {
      <option [value]="easing">{{easing}}</option>
    }
  </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EasingSelectorComponent {
  readonly easingNames = Object.keys(easings) as EasingFnName[];
  readonly $easingFn = model<EasingFn>(easeInBack, { alias: 'easingFn'});
  readonly $easingFnName = computed<EasingFnName>(() => this.getEasingName(this.$easingFn()));

  /** Retrieves the name of the easing function based on the provided easing function or returns "linear". */
  getEasingName(easingFn: EasingFn): EasingFnName {
    return Object.entries(easings).find(([, value]) => value === easingFn)?.[0] as EasingFnName || 'linear';
  }

  /** Sets $easingFn based on the provided easingFnName. */
  setEasingFn(easingFnName: EasingFnName): void {
    this.$easingFn.set(easings[easingFnName]);
  }
}
