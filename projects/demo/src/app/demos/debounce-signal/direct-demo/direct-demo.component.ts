import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-direct-demo',
    imports: [FormsModule],
    templateUrl: './direct-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectDemoComponent {
  readonly $debounceTime = signal(500);
  readonly $directDebounced = debounceSignal('', this.$debounceTime);
}
