import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCode, faFile } from '@fortawesome/free-solid-svg-icons';
import { DEMO_CONFIG_MAP, DUMMY_CONFIGURATION, SignalFunctionName } from '../demo-configuration';
import { SignalTypeBadgeComponent } from './signal-type-badge.component';

@Component({
  selector: 'app-demo-page-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SignalTypeBadgeComponent],
  template: `
<div class="flex flex-row items-center gap-3 doc-header">
  @if($demoConfig(); as demoConfig) {
    <h1>{{demoConfig.name}}</h1>
    <div class="flex flex-row gap-1">
      @for (type of demoConfig.usages; track type) {
        <app-signal-type-badge [type]="type" />
      }
    </div>
    <div class="ml-auto flex flex-row gap-2">
      @if (demoConfig.docUrl) {
        <a class="btn  btn-info btn-sm" [href]="demoConfig.docUrl" title="View API Docs">
          <fa-icon  [icon]="faFile" /> API
        </a>
      }
      @if (demoConfig.sourceUrl) {
        <a class="btn  btn-info btn-sm"
          [href]="'https://github.com/DDtMM/angular-signal-generators/blob/main/projects/signal-generators/src/lib/' + demoConfig.sourceUrl"
          title="View Source" target="_blank">
          <fa-icon  [icon]="faCode" />
          Source
        </a>
      }
    </div>
  }
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoPageHeaderComponent {
  readonly $demoConfig = computed(() => DEMO_CONFIG_MAP[this.$fnName()] ?? DUMMY_CONFIGURATION);
  readonly faFile = faFile;
  readonly faCode = faCode;
  readonly $fnName = input.required<SignalFunctionName>({ alias: 'fnName'});
}
