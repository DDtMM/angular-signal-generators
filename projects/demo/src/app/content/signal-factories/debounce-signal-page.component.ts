
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { DirectDemoComponent } from '../../demos/debounce-signal/direct-demo/direct-demo.component';
import { IndirectDemoComponent } from '../../demos/debounce-signal/indirect-demo/indirect-demo.component';

@Component({
    selector: 'app-debounce-signal-page',
    imports: [DirectDemoComponent, IndirectDemoComponent, DemoHostComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="debounceSignal" />
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
