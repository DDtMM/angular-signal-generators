import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, easeInBack, tweenSignal } from 'projects/signal-generators/src/public-api';
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
