import { ChangeDetectionStrategy, Component } from '@angular/core';
import { springSignal } from '@ddtmm/angular-signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="springSignal">
    <div>
      Tween animations that allow a signal to transform between values over a set duration.
    </div>
    <div class="divider">Example</div>
    <div class="flex flex-col w-full sm:flex-row items-center gap-3">
      <div class="flex-none">
        <div class="join">
          <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(0)">0%</button>
          <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(50)">50%</button>
          <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(100)">100%</button>
        </div>
      </div>
      <div>
        <input class="range range-primary" type="range" [value]="$sliderValue()" min="0" max="100" step=".0001" />
      </div>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpringSignalHomeDemoComponent {
  readonly $sliderValue = springSignal(0, { clamp: true, damping: 5, stiffness: 100 });
}
