import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, tweenSignal } from '@ddtmm/angular-signal-generators';
import { easeInBack } from '@ddtmm/angular-signal-generators/easings';
import { EasingSelectorComponent } from '../shared/easing-selector.component';

@Component({
  selector: 'app-simple-demo',
  standalone: true,
  imports: [EasingSelectorComponent],
  templateUrl: './simple-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleDemoComponent {
  readonly $easingFn = signal<EasingFn>(easeInBack);
  readonly $sliderValue = tweenSignal(0, { easing: this.$easingFn() });
}
