import { ChangeDetectionStrategy, Component } from '@angular/core';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-toggle-demo',
  standalone: true,
  imports: [],
  templateUrl: './toggle-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleDemoComponent {
  readonly $trueFalseToggle = sequenceSignal([true, false]);
}
