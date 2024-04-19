import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, easeInBack , tweenSignal } from 'projects/signal-generators/src/public-api';
import { EasingSelectorComponent } from '../easing-selector.component';

@Component({
  selector: 'app-simple-demo',
  standalone: true,
  imports: [EasingSelectorComponent],
  templateUrl: './simple-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleDemoComponent {
  readonly $easingFn = signal<EasingFn>(easeInBack);
  readonly tweenSignalSimple = tweenSignal(0);
}
