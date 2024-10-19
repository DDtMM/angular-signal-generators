import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-indirect-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './indirect-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndirectDemoComponent {
  readonly $inputText = signal('')
  readonly $debounceTime = signal(500);
  readonly $debouncedText = debounceSignal(this.$inputText, this.$debounceTime);
}
