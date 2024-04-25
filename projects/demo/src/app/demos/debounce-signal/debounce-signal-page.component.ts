import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { DirectDemoComponent } from './direct-demo/direct-demo.component';
import { IndirectDemoComponent } from './indirect-demo/indirect-demo.component';

@Component({
  selector: 'app-debounce-signal-page',
  standalone: true,
  imports: [CommonModule, DirectDemoComponent, IndirectDemoComponent, DemoHostComponent, SignalHeaderComponent],
  template: `
<app-signal-header fnName="debounceSignal" />
<p>
This is very similar to rxjs's <i>debounce</i> operator.
This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal,
and one where it has a <i>set</i> and <i>update</i> method and the change of the value occurs after debounce time elapses.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Directly set debounced signal" pattern="debounce-signal/direct-demo/">
    <app-direct-demo />
  </app-demo-host>
  <app-demo-host name="Debounce another signal's value" pattern="debounce-signal/indirect-demo/">
    <app-indirect-demo />
  </app-demo-host>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebounceSignalPageComponent {


}
