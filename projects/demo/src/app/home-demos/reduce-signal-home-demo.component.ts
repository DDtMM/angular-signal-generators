import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { reduceSignal } from 'projects/signal-generators/src/lib/signals/reduce-signal';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [FormsModule, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
   <app-home-box fnName="reduceSignal">
    <div>
      Creates a signal similar to <code class="inline">Array.reduce</code> or Rxjs's <code class="inline">scan</code> operator,
      using a reducer function to create a new value from the current and prior values.
    </div>
    <div class="divider">Example</div>
    <div class="flex flex-row gap-3" >
      <input type="number" class="input input-bordered input-sm grow" [(ngModel)]="$reduceSource" aria-label="Value to be added to running sum" />
      <button type="button" class="btn btn-sm btn-primary" (click)="$reduceSum.set($reduceSource())">Sum</button>
    </div>
    <div class="flex flex-row gap-3  leading-8">
      <span>Summed: </span>
      <span class="border border-solid border-secondary grow rounded-lg px-3 bg-base-100">{{$reduceSum()}}</span>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReduceSignalHomeDemoComponent {
  readonly $reduceSource = signal(1);
  readonly $reduceSum = reduceSignal(0, (prior, cur) => prior + cur);
}
