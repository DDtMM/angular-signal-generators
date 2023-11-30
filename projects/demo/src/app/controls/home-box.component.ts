import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SignalGeneratorType, SignalTypeBadgeComponent } from './signal-type-badge.component';


@Component({
  selector: 'app-home-box',
  standalone: true,
  imports: [RouterLink, SignalTypeBadgeComponent],
  template: `
  <li class="card card-compact bg-base-100 hover:bg-base-200 shadow-lg">
    <div class="card-body">
      <h3 class="card-title cursor-pointer" [routerLink]="link">
        <a class="link" [routerLink]="link">{{name}}</a>
        @for (badgeType of badgeTypes; track badgeType) {
          <app-signal-type-badge [type]="badgeType"/>
        }

      </h3>
      <ng-content></ng-content>
    </div>
  </li>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeBoxComponent {
  @Input({ required: true }) badgeTypes: SignalGeneratorType[] = [];
  @Input({ required: true }) link: string = '';
  @Input({ required: true }) name: string = '';

  @HostBinding('class.contents') contentsClass: boolean = true;

}
