import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-fibonacci-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './fibonacci-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FibonacciDemoComponent {
  readonly $fibonacci = sequenceSignal((() => {
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
}
