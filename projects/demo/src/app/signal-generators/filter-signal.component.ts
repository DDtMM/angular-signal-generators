import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from '../controls/signal-header.component';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-filter-signal',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FaIconComponent, FormsModule, SignalHeaderComponent],
  template: `
<app-signal-header name="Filter Signal" apiPath="./api/functions/filterSignal-1.html" [types]="['generator', 'signal']" />
<p>
  Filters values from another signal or set to this signal directly based upon the result of a filter function.
  The filter function can be a guard function, changing the return type from the source type of the signal.
</p>
<div role="alert" class="alert alert-warning">
  <fa-icon [icon]="faTriangleExclamation" class="text-info" />
  <div>
    <div> <b>Warning</b></div>
    <div>
      The overloads that accept a signal have an issue where values may not get evaluated, and an older valid value shows.
      This can happen if multiple changes occur before change detection or if the filter signal is not actively consumed.
      When this happens, a previous valid value is shown.
    </div>
  </div>
</div>
<h3>Demo</h3>
<div class="flex flex-row flex-wrap -m-2">
  <div class="m-2">
    <input class="input" class="input input-bordered" type="text"
      [ngModel]="input()" (ngModelChange)="input.set($event)" placeholder="Enter some text" />
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
input = signal&lt;string&gt;('');
maxLengthFilter = filterSignal(this.input, x =&gt; x.length < 5);
onlyLowerCaseFilter = filterSignal(this.input, (x): x is Lowercase&lt;string&gt; =&gt; !/[A-Z]/.test(x),  {{ '{' }} initialValidValue: '' {{ '}' }});
  </pre></app-example-code>
</div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSignalComponent {
  readonly faTriangleExclamation = faTriangleExclamation;
  readonly input = signal<string>('');
  readonly maxLengthFilter = filterSignal(this.input, x => x.length < 5);
  readonly onlyLowerCaseFilter = filterSignal(this.input, (x): x is Lowercase<string> => !/[A-Z]/.test(x), { initialValidValue: '' });

}
