import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mapSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from '../controls/signal-header.component';
import { ExampleCodeComponent } from '../controls/example-code.component';

@Component({
  selector: 'app-map-signal',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FormsModule, SignalHeaderComponent],
  template: `
<app-signal-header fnName="mapSignal" />
<p>
  This creates a signal whose input value is automatically mapped to an output value.
  The selector function can include signals or can be mapped directly from an array of signals.
</p>
<h3>Demo</h3>
<div class="inline-block p-3 bg-secondary-content card card-bordered">
  <div class="grid grid-cols-2 gap-3 shrink">
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
  <h3>Example</h3>
  <app-example-code class="w-full"><pre>
readonly multiplier = signal(2);
readonly inputVal = mapSignal(1, x => x * this.multiplier());
readonly multiplierSquared = mapSignal(this.inputVal, this.multiplier, (a, b) => a * b);
  </pre></app-example-code>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSignalComponent {
  readonly multiplier = signal(2);
  readonly inputVal = mapSignal(1, x => x * this.multiplier());
  readonly multiplierSquared = mapSignal(this.inputVal, this.multiplier, (a, b) => a * b);
}
