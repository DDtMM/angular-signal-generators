import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { timerSignal } from 'projects/signal-generators/src/public-api';
import { extendSignal } from 'projects/signal-generators/src/public-api';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  standalone: true,
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="timerSignal">
      <div>Creates a signal that emits based on a timer or interval.</div>
      <div class="divider">Example</div>
      <div class="flex flex-col gap-3 items-center">
        <div>Time since start</div>
        <div>{{ $timer() }}</div>
      </div>
      <div class="flex flex-row gap-3 justify-center" (click)="$event.stopPropagation()">
        <button type="button" class="btn btn-primary" (click)="$timer.pause()">Pause</button>
        <button type="button" class="btn btn-primary" (click)="$timer.resume()">Resume</button>
        <button type="button" class="btn btn-primary" (click)="$timer.restart()">Restart</button>
      </div>
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerSignalHomeDemoComponent {
  // SSR does not like signals that use timers.
  $timer = isPlatformBrowser(inject(PLATFORM_ID))
    ? timerSignal(1000, 1000)
    : extendSignal(signal(0), { 'pause': () => {}, 'resume': () => {}, 'restart': () => {} });

}
