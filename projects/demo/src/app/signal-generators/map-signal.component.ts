import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { mapSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from './signal-header.component';

@Component({
  selector: 'app-map-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightModule, SignalHeaderComponent],
  template: `
<app-signal-header name="Map Signal" apiPath="./api/functions/mapSignal.html" />
<p>
  This creates a signal whose input value is automatically mapped to an output value.
  The selector function can include signals or can be mapped directly from an array of signals.
</p>
<div class="inline-block">
  <div class="grid grid-cols-2 gap-4 shrink">
    <label class="label" >Input Value</label>
    <input class="input input-bordered text-right " type="number" [ngModel]="inputVal.input()" (ngModelChange)="inputVal.set($event)" />
    <label class="label" >Multiplier</label>
    <input class="input input-bordered text-right " type="number" [ngModel]="multiplier()" (ngModelChange)="multiplier.set($event)" />
    <label class="label" >Output</label>
    <div class="self-center text-right px-6">{{inputVal()}}</div>
    <label class="label" >Multiplier Squared</label>
    <div class="self-center text-right px-6">{{multiplierSquared()}}</div>
  </div>
</div>
<div>
  <h2>Example</h2>
  <pre><code [highlight]="trackedSelectorExample" [languages]="['typescript']"></code></pre>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSignalComponent {
  readonly trackedSelectorExample = `
readonly multiplier = signal(2);
readonly inputVal = mapSignal(1, x => x * this.multiplier());
readonly multiplierSquared = mapSignal(this.inputVal, this.multiplier, (a, b) => a * b);
  `.trim();
  readonly multiplier = signal(2);
  readonly inputVal = mapSignal(1, x => x * this.multiplier());
  readonly multiplierSquared = mapSignal(this.inputVal, this.multiplier, (a, b) => a * b);
}
