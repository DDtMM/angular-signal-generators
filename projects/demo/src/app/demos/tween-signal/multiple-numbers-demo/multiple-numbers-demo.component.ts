import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, tweenSignal } from '@ddtmm/angular-signal-generators';
import { easeInBack } from '@ddtmm/angular-signal-generators/easings';
import { EasingSelectorComponent } from '../shared/easing-selector.component';

@Component({
  selector: 'app-multiple-numbers-demo',
  standalone: true,
  imports: [CommonModule, EasingSelectorComponent],
  templateUrl: './multiple-numbers-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleNumbersDemoComponent {
  readonly $easingFn = signal<EasingFn>(easeInBack);
  readonly $coords = tweenSignal([0, 0], { easing: this.$easingFn() });
}
