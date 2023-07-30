import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { mapSignal } from 'projects/signal-generators/src/lib/generators/map-signal';

@Component({
  selector: 'app-map-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightModule],
  template: `
<h2>Map Signal</h2>
<p>
  This creates a signal whose input value is automatically mapped to an output value.
  The selector function can include signals, and can automatically update with the <b>trackSelector</b> option.
</p>
<div class="inline-block">
  <div class="grid grid-cols-2 gap-4 shrink">
    <label class="label" >Input Value</label>
    <input class="input input-bordered text-right " type="number" [ngModel]="inputVal.input()" (ngModelChange)="inputVal.set($event)" />
    <label class="label" >Multiplier</label>
    <input class="input input-bordered text-right " type="number" [ngModel]="multiplier()" (ngModelChange)="multiplier.set($event)" />
    <label class="label" >Output</label>
    <div class="self-center text-right px-6">{{inputVal()}}</div>
  </div>
</div>
<div>
  <h2>Examples</h2>
  <h3>Tracked Selector</h3>
  <pre><code [highlight]="trackedSelectorExample" [languages]="['typescript']"></code></pre>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSignalComponent {
  readonly trackedSelectorExample = `
multiplier = signal(2);
inputVal = mapSignal(1, x => x * this.multiplier(), { trackSelector: true });
  `.trim();
  readonly multiplier = signal(2);
  readonly inputVal = mapSignal(1, x => x * this.multiplier(), { trackSelector: true });
}
