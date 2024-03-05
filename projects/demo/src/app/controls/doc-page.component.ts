import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_CONFIG_MAP, SignalFunctionName } from '../demo-configuration';
import { HomeBoxComponent } from './home-box.component';
import { SignalHeaderComponent } from './signal-header.component';
import { SignalTypeBadgeComponent } from './signal-type-badge.component';
import { CommonModule } from '@angular/common';

export type DocPageContext = 'homePage' | 'ownPage';

@Component({
  selector: 'app-doc-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HomeBoxComponent, SignalHeaderComponent, SignalTypeBadgeComponent ],
  template: `
<ng-template #shortDescription>
  <ng-content select="[short-description]" />
</ng-template>
@if ($context() === 'ownPage') {
  <app-signal-header [fnName]="$fnName()" />
  <p>
    <ng-container *ngTemplateOutlet="shortDescription" />
  </p>
  <ng-content select="[rest-of-description]" />
  <ng-content select="[demos]" />
}
@else {
  <app-home-box [fnName]="$fnName()">
    <div>
    <ng-container *ngTemplateOutlet="shortDescription" />
    </div>
    <div class="divider">Example</div>
    <ng-content select="[demo-short]" />
  </app-home-box>
}
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocPageComponent {
  readonly $context = input<DocPageContext>('ownPage', { alias: 'context'});
  readonly $fnName = input.required<SignalFunctionName>({ alias: 'fnName' });
  readonly $demoConfig = computed(() => DEMO_CONFIG_MAP[this.$fnName()]);
}
