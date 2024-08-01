import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, LOCALE_ID, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { eventSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-from-signal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './from-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FromSignalDemoComponent {
  private readonly locale = inject(LOCALE_ID);
  readonly $active = computed(() => this.$selected() ?? this.$buttons()?.[0]);
  readonly $buttons = viewChildren<ElementRef<HTMLButtonElement>>('btn');
  readonly $selected = signal<ElementRef<HTMLButtonElement> | undefined>(undefined);
  readonly $lastEvent = eventSignal(this.$active,
    'click',
    (evt: Event) => `${(evt.target as HTMLElement).innerText} clicked at ${formatDate(Date.now(), 'hh:mm:ss.SSS a', 'en-US', this.locale)}`,
    { initialValue: 'No clicks yet' }
  );
}
