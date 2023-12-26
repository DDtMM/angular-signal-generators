import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterSignal } from 'projects/signal-generators/src/public-api';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { SignalHeaderComponent } from '../controls/signal-header.component';
import { reduceSignal } from 'projects/signal-generators/src/lib/generators/reduce-signal';

@Component({
  selector: 'app-reduce-signal',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FormsModule, SignalHeaderComponent],
  template: `
    <app-signal-header fnName="reduceSignal" />
    <p>
      Creates a signal similar to <code class="inline p-1">Array.reduce</code> or Rxjs's <code class="inline p-1">scan</code> operator. When
      the signal is set, the callback function is executed with the prior and currently set value as arguments, returning a new value.
    </p>
    <p>Like other reduce-like functions the value set to the signal does not have to be the same type returned from it.</p>
    <h3>Demo</h3>
    <div class="flex flex-row flex-wrap mb-2 gap-3">

        <input
          class="input"
          class="input input-bordered"
          type="text"
          [ngModel]="$searchInput()"
          (ngModelChange)="$searchInput.set($event)"
          placeholder="Enter some text"
        />

      <button type="button" class="btn btn-primary" (click)="doSearch()" [disabled]="!$searchInput()">Search</button>
    </div>

    <div class="card card-compact shadow-lg">
      <div class="card-body flex flex-col">
        <div class="card-title">Search History</div>
        <ul class="list-inside list-disc">
          @for (historyItem of $searchHistory(); track historyItem) {
          <li>{{ historyItem }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReduceSignalComponent {
  readonly $searchInput = signal('');
  readonly $searchHistory = reduceSignal([] as string[], (prior, x: string) => [...prior, x]);
  readonly onlyLowerCaseFilter = filterSignal('', (x: string): x is Lowercase<string> => !/[A-Z]/.test(x));

  doSearch(): void {
    this.$searchHistory.set(this.$searchInput());
  }
}
