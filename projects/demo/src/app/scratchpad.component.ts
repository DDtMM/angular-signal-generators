import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { intervalSignal } from 'projects/signal-generators/src/lib/generators/interval-signal';

@Component({
  selector: 'app-scratchpad',
  standalone: true,
  imports: [CommonModule],
  template: `
<p>scratchpad</p>
<div>
  {{ secondCounter() }}
</div>
<div>
  {{ doubler() }}
</div>
<div>
  <button type="button" (click)="cancel()">cancel</button>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadComponent {
  readonly secondCounter = intervalSignal(1000);

  readonly doubler = computed(() => this.secondCounter() * 2);

  cancel() {
    this.secondCounter.cancel();
  }
}
