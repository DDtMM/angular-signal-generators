import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { TimerSignalDemoComponent } from './timer-signal-demo/timer-signal-demo.component';


@Component({
  selector: 'app-timer-signal-page',
  standalone: true,
  imports: [CommonModule, DemoHostComponent, FormsModule, SignalHeaderComponent, TimerSignalDemoComponent],
  template: `
<app-signal-header fnName="timerSignal" />
<p>
  This is very similar to rxjs's <i>timer</i> operator.
  It will be have like setTimeout or interval depending on the parameters passed.
  The value of the timer is incremented after every "tick".
</p>
<p>
  The signal has methods to pause, resume and restart the timer.
  Additionally, there is a <b>state</b> signal that will return the current state of the timer.
</p>
<app-demo-host name="Timer and Interval Demo"
  prefix="timer-signal/timer-signal-demo/timer-signal-demo.component"
  [sourceNames]="['.ts', '.html']">
  <app-timer-signal-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerSignalPageComponent {

}
