import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalType } from '../demo-configuration';

@Component({
  selector: 'app-signal-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('writableSignal') {
        <div class="badge leading-4 tooltip bg-green-300"
          data-tip="This can be passed a value to create an writable signal."
          aria-description="Badge indicating this can be passed a value to create an writable signal.">
          W
        </div>
      }
      @case ('generator') {
        <div class="badge leading-4 tooltip bg-blue-300"
          data-tip="This can be passed a signal, observable, or compute function to generate new values."
          aria-description="Badge indicating this can be passed a signal, observable, or compute function to generate new values.">
          <span>G</span>
        </div>
      }
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalTypeBadgeComponent {
  @Input({ required: true }) type: SignalType = 'writableSignal';


}
