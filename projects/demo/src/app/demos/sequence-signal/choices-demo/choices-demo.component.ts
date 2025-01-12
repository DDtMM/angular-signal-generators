import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-choices-demo',
    imports: [FormsModule],
    templateUrl: './choices-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChoicesDemoComponent {
  readonly $sequenceChoices = sequenceSignal(['a', 'b', 'c']);
}
