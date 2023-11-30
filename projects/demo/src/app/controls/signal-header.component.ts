import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SignalGeneratorType, SignalTypeBadgeComponent } from './signal-type-badge.component';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-signal-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SignalTypeBadgeComponent],
  template: `
<div class="flex flex-row items-baseline gap-3">
  <h1>{{name}}</h1>
  <div class="flex flex-row gap-1">
    @for (type of types; track type) {
      <app-signal-type-badge [type]="type"/>
    }
  </div>
  @if (apiPath) {
    <a class="btn btn-sm btn-warning self-end" [href]="apiPath"><fa-icon  [icon]="faFile" /> API Docs</a>
  }
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalHeaderComponent {
  readonly faFile = faFile;

  @Input({ required: true }) apiPath?: string;
  @Input({ required: true }) name?: string;
  @Input({ required: true }) types: SignalGeneratorType[] = [];
}
