import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sessionStorageSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-built-in-storage-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './built-in-storage-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuiltInStorageDemoComponent {
  readonly $stored = sessionStorageSignal('Change Me', 'demos-built-in-storage-greeting');
}
