import { ChangeDetectionStrategy, Component } from '@angular/core';
import { onlineSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-online-signal-demo',
    imports: [],
    templateUrl: './online-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineSignalDemoComponent {
  readonly $online = onlineSignal();
}
