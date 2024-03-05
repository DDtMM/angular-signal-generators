import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-direct-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './direct-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectDemoComponent {
  readonly $debounceTime = signal(500);
  readonly $directDebounced = debounceSignal('', this.$debounceTime);
}
