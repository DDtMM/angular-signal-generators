import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SignalGeneratorType = 'signal' | 'generator';
@Component({
  selector: 'app-signal-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('signal') {
        <div class="badge bg-green-300" title="This can be passed a value to create an updatable signal.">S</div>
      }
      @case ('generator') {
        <div class="badge bg-blue-300" title="This can be passed a signal, observable, or compute function to generate new values.">G</div>
      }
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalTypeBadgeComponent {
  @Input({ required: true }) type: SignalGeneratorType = 'signal';


}
