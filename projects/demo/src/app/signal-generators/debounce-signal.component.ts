import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from './signal-header.component';
import { ExampleCodeComponent } from '../example-code.component';

@Component({
  selector: 'app-debounce-signal',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FormsModule, SignalHeaderComponent],
  template: `
<app-signal-header name="Debounce Signal" apiPath="./api/functions/debounceSignal.html" />
<p>
This is very similar to rxjs's <i>debounce</i> operator.
This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal,
and one where it has a <i>set</i> and <i>update</i> method and the change of the value occurs after debounce time elapses.
</p>
<h3>Comparison</h3>
<div class="grid grid-flow-row grid-cols-1 w-full sm:grid-cols-2 gap-3 pb-3">
  <app-example-code class="w-full"><pre>
// Plain old signals
const inputSignal = signal('');
const debouncedSignal = toSignal(
  toObservable(this.inputSignal).pipe(debounceTime(500)),
  {{ '{' }} initialValue: '' {{ '}' }}
);
  </pre></app-example-code>

  <app-example-code class="w-full"><pre>
// With debounceSignal
const inputDebounced = debounceSignal('', 500);
  </pre></app-example-code>

</div>
<h3>Demo</h3>
<div class="flex flex-col w-full sm:flex-row">
  <div class="flex flex-grow card bg-secondary rounded-box place-items-center">
    <label class="label text-secondary-content" >Indirect</label>
    <input class="input" type="text" [ngModel]="inputText()" (ngModelChange)="inputText.set($event)" />
    <div class="text-secondary-content">Current Value: {{inputText() || '(no value)'}}</div>
    <div class="text-secondary-content">Debounced Value: {{inputTextDebounced() || '(no value)'}}</div>
  </div>
  <div class="divider sm:divider-horizontal"></div>
  <div class="flex flex-grow card bg-secondary rounded-box place-items-center">
    <label class="label text-secondary-content" >Direct</label>
    <input class="input" type="text" [ngModel]="directDebounced()" (ngModelChange)="directDebounced.set($event)" />
    <div class="text-secondary-content">Current Value: {{directDebounced() || '(no value)'}}</div>
  </div>
</div>
<div>
  <div>
    <label class="label" >Debounce Time: {{debounceTime()}}</label>
    <input class="range" type="range" min="0" max="10000" [ngModel]="debounceTime()" (ngModelChange)="debounceTime.set($event)" />
  </div>
</div>
<div>
  <h3>Examples</h3>
  <h3>A Debounced Signal</h3>
  <app-example-code><pre>
const directDebounce = debounceSignal('original', 1000);
directDebounce.set('updated');
setTimeout(() => console.log(directDebounce(), 500)); // original
setTimeout(() => console.log(directDebounce(), 1000)); // updated;
  </pre></app-example-code>
  <h3>Debouncing Another Signal</h3>
  <app-example-code><pre>
const original = signal('unchanged');
const debounced = debounceSignal(original, 500);

original.set('changed');
console.log(original(), debounced()) // changed, unchanged
setTimeout(() => console.log(original(), debounced()), 500) // changed, changed.
  </pre></app-example-code>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebounceSignalComponent {
  readonly inputText = signal('')
  readonly debounceTime = signal(500);
  readonly inputTextDebounced = debounceSignal(this.inputText, this.debounceTime);
  readonly directDebounced = debounceSignal('', this.debounceTime);

}
