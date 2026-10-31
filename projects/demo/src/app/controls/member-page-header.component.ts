
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCode, faFile } from '@fortawesome/free-solid-svg-icons';
import { DEMO_CONFIG_MAP, DUMMY_CONFIGURATION, SignalFunctionName } from '../demo-configuration';
import { SignalTypeBadgeComponent } from './signal-type-badge.component';

@Component({
    selector: 'app-member-page-header',
    host: { class: 'not-prose block' },
    imports: [FontAwesomeModule, SignalTypeBadgeComponent],
    template: `
<header class="doc-header">
  @if($demoConfig(); as demoConfig) {
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <h1 class="min-w-0 max-w-full [overflow-wrap:anywhere]">{{demoConfig.name}}</h1>
      <div class="flex flex-row gap-1">
        @for (type of demoConfig.usages; track type) {
          <app-signal-type-badge [type]="type" />
        }
      </div>
    </div>
    @if (demoConfig.docUrl || demoConfig.sourceUrl) {
    <nav aria-label="Documentation resources" class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      @if (demoConfig.docUrl) {
        <a class="link link-hover inline-flex items-center gap-2 text-base-content/70 hover:text-base-content"
          [href]="demoConfig.docUrl">
          <fa-icon [icon]="faFile" /> API reference
        </a>
      }
      @if (demoConfig.sourceUrl) {
        <a class="link link-hover inline-flex items-center gap-2 text-base-content/70 hover:text-base-content"
          [href]="'https://github.com/DDtMM/angular-signal-generators/blob/main/projects/signal-generators/src/lib/' + demoConfig.sourceUrl"
          target="_blank" rel="noopener noreferrer">
          <fa-icon [icon]="faCode" /> View source
        </a>
      }
    </nav>
    }
  }
</header>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberPageHeaderComponent {
  readonly $demoConfig = computed(() => DEMO_CONFIG_MAP[this.$fnName()] ?? DUMMY_CONFIGURATION);
  readonly faFile = faFile;
  readonly faCode = faCode;
  readonly $fnName = input.required<SignalFunctionName>({ alias: 'fnName'});
}
