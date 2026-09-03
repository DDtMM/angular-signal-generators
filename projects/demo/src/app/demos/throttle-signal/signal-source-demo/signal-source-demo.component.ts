import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { throttleSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-throttle-signal-source-demo',
  templateUrl: './signal-source-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalSourceDemoComponent {
  readonly $source = signal(0);
  readonly $throttled = throttleSignal(this.$source, 1000);
}
