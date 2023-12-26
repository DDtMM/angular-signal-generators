import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterSignal } from 'projects/signal-generators/src/public-api';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { SignalHeaderComponent } from '../controls/signal-header.component';

@Component({
  selector: 'app-filter-signal',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FormsModule, SignalHeaderComponent],
  template: `
<app-signal-header fnName="filterSignal" />
<p>
  Filters values set to this signal directly upon the result of a filter function.
  The filter function can be a guard function, changing the return type from the source type of the signal.
</p>
<h3>Demo</h3>
<div class="flex flex-row flex-wrap -m-2">
  <div class="m-2">
    <input class="input" class="input input-bordered" type="text"
      [ngModel]="''" (ngModelChange)="setFilters($event)" placeholder="Enter some text" />
  </div>

</div>
<div class="flex flex-col sm:flex-row gap-3">
  <div class="flex-grow card card-compact shadow-lg">
    <div class="card-body flex flex-col items-center">
      <label class="label">Max Length Filter</label>
      <div class="h-7 text-lg">{{maxLengthFilter()}}</div>
    </div>
  </div>
  <div class="flex-grow card card-compact  shadow-lg">
    <div class="card-body flex flex-col items-center">
      <label class="label">Lower case Filter</label>
      <div class="h-7 text-lg">{{onlyLowerCaseFilter()}}</div>
    </div>
  </div>
</div>
<div>
  <h3>Example</h3>
  <app-example-code><pre>
maxLengthFilter = filterSignal('', x =&gt; x.length < 5);
onlyLowerCaseFilter = filterSignal('', (x): x is Lowercase&lt;string&gt; =&gt; !/[A-Z]/.test(x),  {{ '{' }} initialValidValue: '' {{ '}' }});
setFilters(value: string): void {{ '{' }}
  this.maxLengthFilter.set(value);
  this.onlyLowerCaseFilter.set(value);
{{ '}' }}
  </pre></app-example-code>
</div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSignalComponent {

  readonly maxLengthFilter = filterSignal<string>('', x => x.length < 5);
  readonly onlyLowerCaseFilter = filterSignal('', (x: string): x is Lowercase<string> => !/[A-Z]/.test(x));

  setFilters(value: string): void {
    this.maxLengthFilter.set(value);
    this.onlyLowerCaseFilter.set(value);
  }
}
