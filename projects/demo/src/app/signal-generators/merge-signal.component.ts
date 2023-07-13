import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalSourceComponent } from '../shared/signal-source.component';

@Component({
  selector: 'app-merge-signal',
  standalone: true,
  imports: [CommonModule, SignalSourceComponent],
  template: `
<h1>Merge Signal</h1>
<app-signal-source />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeSignalComponent {

}
