import { ChangeDetectionStrategy, Component } from '@angular/core';
import { idleSignal } from '@ddtmm/angular-signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="idleSignal">
      <div>Detects when the user is idle based on browser events like mouse movement, clicks, and keyboard input.</div>
      <div class="divider">Example</div>
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-2">
          <span>Status:</span>
          <div 
            class="badge" 
            [class.badge-success]="!$idle().isIdle" 
            [class.badge-warning]="$idle().isIdle">
            {{ $idle().isIdle ? 'IDLE' : 'ACTIVE' }}
          </div>
        </div>
        <div class="text-sm">
          Time since last change: {{ formatTime($idle().timeSinceLastChange) }}
        </div>
        <div class="text-xs text-base-content/70">
          Last reason: {{ $idle().changeReason }}
        </div>
      </div>
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdleSignalHomeDemoComponent {
  readonly $idle = idleSignal({ idleTimeout: 30000 });

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  }
}
