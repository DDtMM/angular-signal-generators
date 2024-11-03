import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sessionStorageSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-built-in-storage-demo',
    imports: [FormsModule],
    templateUrl: './built-in-storage-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuiltInStorageDemoComponent {
  readonly $stored = sessionStorageSignal('Change Me', 'demos-built-in-storage-greeting');
}
