import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { timerSignal } from '@ddtmm/angular-signal-generators';

/** Can copy element or text to clipboard by clicking the button. */
@Component({
    selector: 'app-copy-button',
    imports: [ClipboardModule, CommonModule, FontAwesomeModule],
    template: `
    <button type="button" class="btn btn-ghost btn-square btn-sm opacity-50 hover:opacity-100 "
      [cdkCopyToClipboard]="$content() ?? ''"
      [attr.aria-label]="$description()"
      (click)="$clickAnimationTimer.restart()">
      <fa-icon [icon]="faCopy" [ngClass]="$clickAnimationClass()" />
    </button>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyButtonComponent {
  /** Raw string content to copy from. */
  readonly $clickAnimationTimer = timerSignal(1000, null, { stopped: true });
  readonly $clickAnimationClass = computed(() =>
    this.$clickAnimationTimer.state() === 'running' && this.$clickAnimationTimer() === 0 ? 'animate-pulse' : ''
  );
  readonly $content = input<string | null | undefined>(undefined, { alias: 'content' });
  readonly $description = input<string>('Copy nearby text', { alias: 'description ' });
  readonly faCopy = faCopy;
}
