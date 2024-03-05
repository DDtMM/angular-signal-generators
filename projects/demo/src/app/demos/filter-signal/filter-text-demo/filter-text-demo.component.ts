import { ChangeDetectionStrategy, Component } from '@angular/core';
import { filterSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-filter-text-demo',
  standalone: true,
  templateUrl: './filter-text-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTextDemoComponent {
  readonly maxLengthFilter = filterSignal<string>('', x => x.length < 5);
  readonly onlyLowerCaseFilter = filterSignal('', (x: string): x is Lowercase<string> => !/[A-Z]/.test(x));

  setFilters(value: string): void {
    this.maxLengthFilter.set(value);
    this.onlyLowerCaseFilter.set(value);
  }
}
