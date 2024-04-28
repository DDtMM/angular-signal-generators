import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timerSignal } from 'projects/signal-generators/src/public-api';

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
  readonly $mode = signal<'timeout' | 'interval'>('interval');
  readonly $timer = computed(() => this.$mode() === 'timeout' ? this.$timeoutTimer : this.$intervalTimer);
  readonly $timeoutRange = signal(500);
  // timer signal and SSR don't mix.
  readonly $intervalTimer = timerSignal(this.$timeoutRange, this.$intervalRange);
  // timer signal and SSR don't mix.
  readonly $timeoutTimer = timerSignal(this.$timeoutRange);

  constructor() {
    effect(() => {
      const timerValue = this.$timer()();
      if (timerValue !== 0) {
        this.$executions.update(x => ++x);
      }
    }, { allowSignalWrites: true })
  }

  toggleMode(): void {
    this.$timer().pause();
    this.$mode.update(x => x === 'interval' ? 'timeout' : 'interval');
    this.$timer().restart();
  }
}
