import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { historySignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-history-editor-demo',
  imports: [FormsModule],
  templateUrl: './editor-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorDemoComponent {
  readonly $text = historySignal('Every edit is retained.', { limit: 20 });
}
