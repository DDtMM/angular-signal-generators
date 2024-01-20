import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { DEMO_CONFIG_MAP, DemoConfigurationItem, SignalFunctionName } from '../demo-configuration';
import { SignalTypeBadgeComponent } from './signal-type-badge.component';

@Component({
  selector: 'app-signal-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SignalTypeBadgeComponent],
  template: `
<div class="flex flex-row items-baseline gap-3">
  @if($demoConfig(); as demoConfig) {
    <h1>{{demoConfig.name}}</h1>
    <div class="flex flex-row gap-1">
      @for (type of demoConfig.usages; track type) {
        <app-signal-type-badge [type]="type"/>
      }
    </div>
    @if (demoConfig.docUrl) {
      <a class="btn btn-sm btn-warning self-end" [href]="demoConfig.docUrl"><fa-icon  [icon]="faFile" /> API Docs</a>
    }
  }
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalHeaderComponent {
  readonly $demoConfig = signal<DemoConfigurationItem<string> | undefined>(undefined);

  readonly faFile = faFile;

  @Input({ required: true })
  set fnName(value: SignalFunctionName) {
    this.$demoConfig.set(DEMO_CONFIG_MAP[value]);
  }
}
