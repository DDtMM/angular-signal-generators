import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { debounceSignal } from 'projects/signal-generators/src/public-api';


@Component({
  selector: 'app-debounce-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightModule],
  template: `
<h2>Debounce Signal</h2>
<p>
This is very similar to rxjs's <i>debounce</i> operator.
This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal,
and one where it has a <i>set</i> and <i>update</i> method and the change of the value occurs after debounce time elapses.
</p>
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
  <h2>Examples</h2>
  <h3>A Debounced Signal</h3>
  <pre><code [highlight]="standaloneSignalExample" [languages]="['typescript']"></code></pre>
  <h3>Debouncing Another Signal</h3>
  <pre><code [highlight]="fromSourceSignalExample" [languages]="['typescript']"></code></pre>
</div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebounceSignalComponent {
  readonly inputText = signal('')
  readonly debounceTime = signal(500);
  readonly inputTextDebounced = debounceSignal(this.inputText, this.debounceTime);
  readonly directDebounced = debounceSignal('', this.debounceTime);

  readonly standaloneSignalExample = `
const directDebounce = debounceSignal('original', 1000);
directDebounce.set('updated');
setTimeout(() => console.log(directDebounce(), 500); // original
setTimeout(() => console.log(directDebounce(), 1000); // updated
  `.trim();

  readonly fromSourceSignalExample = `
const original = signal('unchanged');
const debounced = debounceSignal(original, 500);

original.set('changed');
console.log(original(), debounced()) // changed, unchanged
setTimeout(() => console.log(original(), debounced()), 500) // changed, changed.
`.trim();
}
