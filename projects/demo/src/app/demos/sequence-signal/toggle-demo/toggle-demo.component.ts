import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-toggle-demo',
    imports: [FormsModule],
    templateUrl: './toggle-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleDemoComponent {
  readonly $trueFalseToggle = sequenceSignal([false, true]);
}
