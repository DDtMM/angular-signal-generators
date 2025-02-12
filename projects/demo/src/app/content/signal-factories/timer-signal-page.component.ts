import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { TimerSignalDemoComponent } from '../../demos/timer-signal/timer-signal-demo/timer-signal-demo.component';


@Component({
    selector: 'app-timer-signal-page',
    imports: [CommonModule, DemoHostComponent, MemberPageHeaderComponent, TimerSignalDemoComponent],
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
<app-demo-host name="Timer and Interval Demo" pattern="timer-signal/timer-signal-demo/">
  <app-timer-signal-demo />
</app-demo-host>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerSignalPageComponent {

}
