import { ChangeDetectionStrategy, Component } from '@angular/core';
import { easeInBounce, tweenSignal } from 'projects/signal-generators/src/public-api';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  standalone: true,
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="tweenSignal">
    <div>
      Tween animations that allow a signal to transform between values over a set duration.
    </div>
    <div class="divider">Example</div>
    <input type="range" class="range range-primary" [value]="$tween()" min="0" max="100" />
    <div class="flex flex-row gap-3 justify-center">
      <div class="join">
        <button type="button" class="btn btn-primary join-item" (click)="$tween.set(0)">0%</button>
        <button type="button" class="btn btn-primary join-item" (click)="$tween.set(50)">50%</button>
        <button type="button" class="btn btn-primary join-item" (click)="$tween.set(100)">100%</button>
      </div>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TweenSignalHomeDemoComponent {
  readonly $tween = tweenSignal(0, { duration: 1000, easing: easeInBounce });
}
