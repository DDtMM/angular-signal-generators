import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { reduceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-search-history-demo',
    imports: [CommonModule],
    templateUrl: './search-history-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchHistoryDemoComponent {
  readonly $searchText = signal('')
  readonly $searchHistory = reduceSignal<{ on: Date, value: string }[], string>([],
    (prior, x) => [...prior, { on: new Date(), value: x }]);

  doSearch(value: string): void {
    this.$searchHistory.set(value);
  }
}
