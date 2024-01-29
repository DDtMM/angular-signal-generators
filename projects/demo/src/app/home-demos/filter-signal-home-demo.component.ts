import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterSignal } from 'projects/signal-generators/src/public-api';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [FormsModule, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="filterSignal">
      <div>Filters values set directly on the signal.</div>
      <div class="divider">Example</div>
      <div class="flex flex-col gap-3">
        <div class="flex flex-row gap-3 items-baseline">
          <label>Input</label>
          <input type="text" class="input input-bordered input-sm grow" [ngModel]="filtered()" (ngModelChange)="filtered.set($event)" />
        </div>
        <div class="flex flex-row gap-3  leading-8">
          <span>Filtered</span>
          <span class="border border-solid border-secondary grow rounded-lg px-3 bg-base-100">{{ filtered() }}</span>
        </div>
      </div>
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSignalHomeDemoComponent {
  readonly filtered = filterSignal<string>('no upper case letters please', (x) => !/[A-Z]/.test(x));
}
