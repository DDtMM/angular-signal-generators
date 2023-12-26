import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tweenSignal } from 'projects/signal-generators/src/public-api';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  selector: 'app-tween-signal',
  standalone: true,
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="tweenSignal">
    <div>
      Tween animations that allow a signal to transform between values over a set duration.
    </div>
    <div class="divider">Example</div>
    <input type="range" class="range range-primary" [value]="tweenExample()" min="0" max="100" />
    <div class="flex flex-row gap-3 justify-center" (click)="$event.stopPropagation()">
      <div class="join pr-3">
        <button type="button" class="btn btn-primary join-item" (click)="tweenExample.set(0)">0%</button>
        <button type="button" class="btn btn-primary join-item" (click)="tweenExample.set(50)">50%</button>
        <button type="button" class="btn btn-primary join-item" (click)="tweenExample.set(100)">100%</button>
      </div>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TweenSignalComponent {
  readonly tweenExample = tweenSignal(0, { duration: 1000, easing: 'easeInBounce' });
}
