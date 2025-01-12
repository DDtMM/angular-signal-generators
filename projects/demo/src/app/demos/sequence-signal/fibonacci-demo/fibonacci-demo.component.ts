import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-fibonacci-demo',
    imports: [FormsModule],
    templateUrl: './fibonacci-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FibonacciDemoComponent {
  readonly $fibonacci = sequenceSignal({
    [Symbol.iterator]() {
      let current = 0;
      let next = 1;
  
      return {
        next() {
          const value = current;
          [current, next] = [next, current + next];
          return { value, done: false };
        }
      };
    }
  });
  readonly $fibonacciStepSize = signal(1);
}
