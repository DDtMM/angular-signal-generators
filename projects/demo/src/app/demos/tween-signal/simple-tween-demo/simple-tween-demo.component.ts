import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, tweenSignal } from '@ddtmm/angular-signal-generators';
import { easeInBack } from '@ddtmm/angular-signal-generators/easings';
import { EasingSelectorComponent } from '../shared/easing-selector.component';

@Component({
    selector: 'app-simple-tween-demo',
    imports: [EasingSelectorComponent],
    templateUrl: './simple-tween-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleTweenDemoComponent {
  readonly $easingFn = signal<EasingFn>(easeInBack);
  readonly $sliderValue = tweenSignal(0, { easing: this.$easingFn() });
}
