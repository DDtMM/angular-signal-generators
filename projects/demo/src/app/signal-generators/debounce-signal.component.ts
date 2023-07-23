import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from 'projects/signal-generators/src/public-api';


@Component({
  selector: 'app-debounce-signal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebounceSignalComponent {
  readonly inputText = signal('')
  readonly debounceTime = signal(500);
  readonly inputTextDebounced = debounceSignal(this.inputText, this.debounceTime);
  readonly directDebounced = debounceSignal('', this.debounceTime);

}
