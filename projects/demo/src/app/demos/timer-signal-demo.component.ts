import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timerSignal, TimerSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from '../controls/signal-header.component';


@Component({
  selector: 'app-timer-signal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalHeaderComponent],
  template: `
<app-signal-header fnName="timerSignal" />
<p>
  This is very similar to rxjs's <i>timer</i> operator.
  It will be have like setTimeout or interval depending on the parameters passed.
  The value of the timer is incremented after every "tick".
</p>
<h3>Demo</h3>
<div class="flex flex-col w-full sm:flex-row items-center">
  <div class="flex-none">
    <div class="join pr-3">
      <button type="button" class="btn btn-primary join-item" (click)="getTimer().pause()">Pause</button>
      <button type="button" class="btn btn-primary join-item" (click)="getTimer().resume()">Resume</button>
      <button type="button" class="btn btn-primary join-item" (click)="getTimer().restart()">Restart</button>
      <div class="join-item divider"></div>
      <button type="button" class="btn btn-secondary join-item" (click)="toggleMode()">{{ mode() }} Mode</button>
    </div>
  </div>
  <div class="flex-1">
    <div>
      <label class="label">Timeout Time: {{timeoutRange()}}</label>
      <input class="range range-primary" type="range" min="0" max="10000" [ngModel]="timeoutRange()" (ngModelChange)="timeoutRange.set($event)" />
    </div>
    <div>
      <label class="label" >Interval Time: {{intervalRange()}}</label>
      <input class="range" type="range" min="0" max="10000" [ngModel]="intervalRange()" (ngModelChange)="intervalRange.set($event)"
        [ngClass]="mode() === 'interval' ? 'range-primary' : 'range-accent'"
        [disabled]="mode() === 'timeout'" />
    </div>
  </div>
</div>
<div class="flex flex-col w-full sm:flex-row gap-3">
  <div class="flex-grow card card-compact  shadow-lg">
    <div class="card-body flex flex-col items-center">
      <div>Ticks since Restart</div>
      <div class="h-7 text-lg">{{timer()}}</div>
    </div>
  </div>
  <div class="flex-grow card card-compact shadow-lg rounded-box">
    <div class="card-body flex flex-col items-center">
      <div>Total Ticks</div>
      <div class="h-7 text-lg">{{executions()}}</div>
    </div>
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerSignalDemoComponent {

  executionCount = -1;
  readonly mode = signal<'timeout' | 'interval'>('interval');
  readonly timeoutRange = signal(500);
  readonly intervalRange = signal(500);
  startTime = performance.now();
  readonly timeoutTimer = timerSignal(this.timeoutRange);
  readonly intervalTimer = timerSignal(this.timeoutRange, this.intervalRange);
  readonly timer = computed(() => this.getTimer()());

  readonly executions = computed(() => {
    this.timer();
    return ++this.executionCount;
  });
  toggleMode(): void {
    this.getTimer().pause();
    this.mode.update(x => x === 'interval' ? 'timeout' : 'interval');
    this.getTimer().resume();
  }
  getTimer(): TimerSignal {
    return this.mode() === 'timeout' ? this.timeoutTimer : this.intervalTimer;
  }
}
