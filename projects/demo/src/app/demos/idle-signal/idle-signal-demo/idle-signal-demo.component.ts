import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { idleSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-idle-signal-demo',
  imports: [FormsModule],
  templateUrl: './idle-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdleSignalDemoComponent {
  readonly $idleTimeout = signal(30000);
  readonly $idle = idleSignal({
    idleTimeout: this.$idleTimeout()
  });

  get idleTimeoutSeconds(): number {
    return this.$idleTimeout() / 1000;
  }

  set idleTimeoutSeconds(value: number) {
    this.$idleTimeout.set(value * 1000);
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
}
