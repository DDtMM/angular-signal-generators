import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { internalTimerSignal } from 'projects/signal-generators/src/lib/internal/internal-timer-signal';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <p>
      <input type="range" min="0" max="10000" [ngModel]="intervalRange()" (ngModelChange)="intervalRange.set($event)" />
      {{intervalRange()}}
    </p>
    <p>
      {{timer()}}
    </p>
    <p>
      Executions: {{executions()}}
    </p>
    <p>
      Avg Execution Time: {{executionAvgDuration()}}
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent {
  executionCount = -1;
  readonly intervalRange = signal(1500);
  readonly startTime = performance.now();
  readonly timer = internalTimerSignal(this.intervalRange, this.intervalRange);
  readonly executions = computed(() => {
    this.timer();
    return ++this.executionCount;
  });
  readonly executionAvgDuration = computed(() => {
    return (performance.now() - this.startTime) / this.executions();
  })
}
