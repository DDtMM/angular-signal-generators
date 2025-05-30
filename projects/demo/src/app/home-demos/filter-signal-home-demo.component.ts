import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterSignal } from '@ddtmm/angular-signal-generators';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
    imports: [FormsModule, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
    <app-home-box fnName="filterSignal">
      <div>Filters values set directly on the signal.</div>
      <div class="divider">Example</div>
      <div class="flex flex-col gap-3">
        <div class="flex flex-row gap-3 items-baseline">
          <label for="filterSignalHomeDemoInput">Input</label>
          <input id="filterSignalHomeDemoInput" type="text" class="input input-bordered input-sm grow" [(ngModel)]="$filtered" />
        </div>
        <div class="flex flex-row gap-3  leading-8">
          <span>Filtered</span>
          <span class="border border-solid border-secondary grow rounded-lg px-3 bg-base-100">{{ $filtered() }}</span>
        </div>
      </div>
    </app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSignalHomeDemoComponent {
  readonly $filtered = filterSignal<string>('no upper case letters please', (x) => !/[A-Z]/.test(x));
}
