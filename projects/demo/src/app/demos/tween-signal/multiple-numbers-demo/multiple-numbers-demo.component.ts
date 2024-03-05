import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingName, tweenSignal } from 'projects/signal-generators/src/public-api';
import { EasingSelectorComponent } from '../easing-selector.component';

@Component({
  selector: 'app-multiple-numbers-demo',
  standalone: true,
  imports: [CommonModule, EasingSelectorComponent],
  templateUrl: './multiple-numbers-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleNumbersDemoComponent {
  readonly $easingFn = signal<EasingName>('easeInBack');
  readonly $coords = tweenSignal([0, 0]);
}
