import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_CONFIG_MAP, DUMMY_CONFIGURATION, SignalFunctionName } from '../demo-configuration';
import { ContentsClassDirective } from './contents-class.directive';
import { SignalTypeBadgeComponent } from './signal-type-badge.component';


@Component({
  selector: 'app-home-box',
  standalone: true,
  imports: [RouterLink, SignalTypeBadgeComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  @if ($demoConfig(); as demoConfig) {
    <li class="card card-compact bg-base-100 hover:bg-base-200 shadow-lg">
      <div class="card-body">
        <h3 class="card-title cursor-pointer" [routerLink]="demoConfig.route">
          <a class="link" [routerLink]="demoConfig.route">{{demoConfig.name}}</a>
          @for (signalType of demoConfig.usages; track signalType) {
            <app-signal-type-badge [type]="signalType"/>
          }
        </h3>
        <ng-content></ng-content>
      </div>
    </li>
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeBoxComponent {
  readonly $demoConfig = computed(() => DEMO_CONFIG_MAP[this.$fnName()] ?? DUMMY_CONFIGURATION);
  readonly $fnName = input.required<SignalFunctionName>({ alias: 'fnName' });
}
