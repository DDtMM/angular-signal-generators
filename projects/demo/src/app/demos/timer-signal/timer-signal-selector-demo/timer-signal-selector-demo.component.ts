import { Component } from '@angular/core';
import { timerSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-timer-signal-selector-demo',
  templateUrl: './timer-signal-selector-demo.component.html',
  standalone: true,
  imports: [],
})
export class TimerSignalSelectorDemoComponent {
  readonly $timer = timerSignal(1000, 1000, { selector: (tickCount: number) => `${tickCount.toString(16)} hex seconds elapsed` })
}
