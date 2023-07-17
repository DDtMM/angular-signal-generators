import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { intervalSignal } from 'projects/signal-generators/src/lib/generators/interval-signal';
import { debounceSignal } from 'projects/signal-generators/src/lib/generators/debounce-signal';

@Component({
  selector: 'app-scratchpad',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
<div>
  <input type="text" [ngModel]="textValue()" (ngModelChange)="textValue.set($event)" />
</div>
<div>
  <input type="range" min="25" max="10000" [ngModel]="rangeSignal" (ngModelChange)="rangeSignal.set($event)" /> {{rangeSignal()}}
</div>
<div>
  {{debounced()}}
</div>
<div>
  {{debounced2()}}
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadComponent {
  readonly doubler = computed(() => this.secondCounter() * 2);
  readonly secondCounter = intervalSignal(1000);

  readonly textValue = signal('XTY');
  readonly rangeSignal = signal(1000);
  readonly debounced = debounceSignal(this.textValue, this.rangeSignal, {});
  readonly debounced2 = debounceSignal(this.doubler, this.rangeSignal, {});
  cancel() {
    this.secondCounter.pause();
  }
}
