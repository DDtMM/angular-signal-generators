import { ChangeDetectionStrategy, Component } from '@angular/core';
import { timerSignal } from 'projects/signal-generators/src/public-api';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  selector: 'app-timer-signal',
  standalone: true,
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="timerSignal">
      <div>Creates a signal that emits based on a timer or interval.</div>
      <div class="divider">Example</div>
      <div class="flex flex-col gap-3 items-center">
        <div>Time since start</div>
        <div>{{ timerExample() }}</div>
      </div>
      <div class="flex flex-row gap-3 justify-center" (click)="$event.stopPropagation()">
        <button type="button" class="btn btn-primary" (click)="timerExample.pause()">Pause</button>
        <button type="button" class="btn btn-primary" (click)="timerExample.resume()">Resume</button>
        <button type="button" class="btn btn-primary" (click)="timerExample.restart()">Restart</button>
      </div>
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerSignalComponent {
  readonly timerExample = timerSignal(1000, 1000);
}
