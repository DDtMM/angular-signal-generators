import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_CONFIG_MAP, DemoConfigurationItem, SignalFunctionName } from '../demo-configuration';
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
          @for (signalType of demoConfig.signalTypes; track signalType) {
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
  readonly $demoConfig = signal<DemoConfigurationItem<string> | undefined>(undefined);

  @Input({ required: true })
  set fnName(value: SignalFunctionName) {
    this.$demoConfig.set(DEMO_CONFIG_MAP[value]);
  }
}
