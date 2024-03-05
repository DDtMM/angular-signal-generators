import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UsageType } from '../demo-configuration';

@Component({
  selector: 'app-signal-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type()) {
      @case ('generator') {
        <div class="badge leading-4 tooltip bg-blue-300"
          data-tip="This can be passed a signal, observable, or compute function to generate new values."
          aria-description="Badge indicating this can be passed a signal, observable, or compute function to generate new values.">
          <span>G</span>
        </div>
      }
      @case ('utility') {
        <div class="badge leading-4 tooltip bg-yellow-300"
          data-tip="A function that does not create a signal but can be used with one."
          aria-description="Badge indicating this is a function that does not create a signal but can be used with one.">
          U
        </div>
      }
      @case ('writableSignal') {
        <div class="badge leading-4 tooltip bg-green-300"
          data-tip="This can be passed a value to create an writable signal."
          aria-description="Badge indicating this can be passed a value to create an writable signal.">
          W
        </div>
      }
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalTypeBadgeComponent {
  readonly type = input.required<UsageType>();

}
