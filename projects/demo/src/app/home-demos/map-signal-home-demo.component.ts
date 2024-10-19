import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mapSignal } from '@ddtmm/angular-signal-generators';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [FormsModule, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="mapSignal">
    <div>
      Creates a signal whose input value is immediately mapped to a different value based on a selector.
      Either a value or multiple signals can be passed and used in the selector function.
    </div>
    <div class="divider">Example</div>
    <div class="flex flex-col gap-3">
      <div class="flex flex-row gap-3 items-baseline">
        <label for="mapSignalHomeInput">Input</label>
        <input #input id="mapSignalHomeInput" type="number" class="input input-bordered input-sm grow" [(ngModel)]="$mapSource" />
      </div>
      <div class="flex flex-row gap-3  leading-8">
        <span>Doubled</span>
        <span class="border border-solid border-secondary grow rounded-lg px-3 bg-base-100">{{$mapDoubled()}}</span>
      </div>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSignalHomeDemoComponent {
  readonly $mapSource = signal(1);
  readonly $mapDoubled = mapSignal(this.$mapSource, x => x * 2);
}
