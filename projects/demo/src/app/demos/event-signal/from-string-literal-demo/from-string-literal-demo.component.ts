import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { eventSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-from-string-literal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './from-string-literal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FromStringLiteralDemoComponent {
  readonly $bodyInteraction = eventSignal('body', 'click',
    (event: MouseEvent) => `Interacted with body at (${event.clientX}, ${event.clientY})`, { initialValue: 'No interactions yet'});
}
