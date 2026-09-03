import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { historySignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-history-source-demo',
  templateUrl: './source-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SourceDemoComponent {
  readonly $source = signal(0);
  readonly $history = historySignal(this.$source);

  emitNext(): void {
    this.$source.update(value => value + 1);
  }

  emitThreeSynchronously(): void {
    this.$source.update(value => value + 1);
    this.$source.update(value => value + 1);
    this.$source.update(value => value + 1);
  }
}
