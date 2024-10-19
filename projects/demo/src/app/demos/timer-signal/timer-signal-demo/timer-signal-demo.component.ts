import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal, timerSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-timer-signal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timer-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerSignalDemoComponent {

  readonly $executions = signal(0);
  readonly $intervalRange = signal(500);
  readonly $mode = sequenceSignal(['interval', 'timeout'] as const);
  readonly $timer = computed(() => this.$mode() === 'timeout' ? this.$timeoutTimer : this.$intervalTimer);
  readonly $timeoutRange = signal(500);
  // timer signal and SSR don't mix.
  readonly $intervalTimer = timerSignal(this.$timeoutRange, this.$intervalRange);
  // timer signal and SSR don't mix.
  readonly $timeoutTimer = timerSignal(this.$timeoutRange);

  constructor() {
    // This is a good example of the danger of using effects to try to maintain a state.
    // There is the possibility that timer ticks will be missed and the count of $executions will be wrong.
    effect(() => {
      const timerValue = this.$timer()();
      if (timerValue !== 0) {
        this.$executions.update(x => ++x);
      }
    }, { allowSignalWrites: true });
  }

  toggleMode(): void {
    this.$timer().pause();
    this.$mode.next();
    this.$timer().restart();
  }
}
