import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { TimerSignalDemoComponent } from '../../demos/timer-signal/timer-signal-demo/timer-signal-demo.component';
import { TimerSignalSelectorDemoComponent } from "../../demos/timer-signal/timer-signal-selector-demo/timer-signal-selector-demo.component";


@Component({
    selector: 'app-timer-signal-page',
    imports: [CommonModule, DemoHostComponent, MemberPageHeaderComponent, TimerSignalDemoComponent, TimerSignalSelectorDemoComponent],
    template: `
<app-member-page-header fnName="timerSignal" />
<p>
  This is very similar to rxjs's <i>timer</i> operator.
  It will be have like setTimeout or interval depending on the parameters passed.
  The value of the timer is incremented after every "tick".
</p>
<p>
  The signal has methods to pause, resume and restart the timer.
  Additionally, there is a <b>state</b> signal that will return the current state of the timer.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Timer and Interval Demo" pattern="timer-signal/timer-signal-demo/">
    <app-timer-signal-demo />
  </app-demo-host>
  <app-demo-host name="Using a Selector" pattern="timer-signal/timer-signal-selector-demo/">
    <p>
      The timer signal can use a selector function to transform the tick count into a different value.
      In this case, the tick count is converted to a hexadecimal string.
    </p>
    <app-timer-signal-selector-demo />
  </app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerSignalPageComponent {

}
