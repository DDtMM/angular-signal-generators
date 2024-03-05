import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mapSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-math-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './math-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathDemoComponent {
  /** A value directly mapped.  */
  readonly $inputVal = mapSignal(1, x => x * this.$multiplier());
  readonly $multiplier = signal(2);
  /** Two signals mapped. */
  readonly $multiplierSquared = mapSignal(this.$inputVal, this.$multiplier, (a, b) => a * b);
}
