import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from 'projects/signal-generators/src/lib/generators/sequence-signal';


@Component({
  selector: 'app-timer-signal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<h2>Sequence Signal</h2>
<p>
  This accepts a sequence of values, and moves to the next value after every call to next.
</p>
<div>
  <button type="button" class="btn btn-primary" (click)="trueFalseToggle.next()">TOGGLE ME - {{trueFalseToggle()}}</button>
</div>
<h3>fibonacci sequence</h3>
<div class="flex flex-row items-center">
  <div class="flex flex-col text-center px-3">
    <div class="label">Value</div>
    <div class="text-lg">{{fibonacci()}}</div>
  </div>
  <div class="px-3">
    <label class="label">Step Size: {{fibonacciStepSize}}</label>
    <input class="range" type="range" min="-10" max="10" [(ngModel)]="fibonacciStepSize" />
  </div>
  <button type="button" class="btn btn-primary" (click)="fibonacci.next(fibonacciStepSize)">Next</button>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SequenceSignalComponent {
  readonly fibonacci = sequenceSignal((() => {
    let values = [1, 2];
    return {
      next: (relativeChange: number) => {
        for (let i = 0; i < relativeChange; i++) {
          values = [values[1], values[0] + values[1]];
        }
        for (let i = relativeChange; i < 0; i++) {
          values = [Math.max(1, values[1] - values[0]), Math.max(values[0], 2)];
        }
        return { hasValue: true, value: values[0] };
      },
      reset: () => values = [1, 2]
    };
  })());
  fibonacciStepSize = 1;

  readonly trueFalseToggle = sequenceSignal([true, false]);

}
