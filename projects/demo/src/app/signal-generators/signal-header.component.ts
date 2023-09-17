import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-signal-header',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="flex flex-row">
  <h2>{{name}}</h2>
  <a *ngIf="apiPath" class="link self-end ml-3" [href]="apiPath">API Docs</a>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalHeaderComponent {
  @Input() apiPath?: string;
  @Input() name?: string;
}
