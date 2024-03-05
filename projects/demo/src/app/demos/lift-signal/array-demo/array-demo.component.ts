import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { liftSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-array-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './array-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayDemoComponent {
  readonly $numbers = liftSignal(
    [this.randomNumber(), this.randomNumber(), this.randomNumber()],
    ['concat'], // updaters work great
    ['push', 'pop', 'shift'] // mutators are a bit iffy.
  );

  randomNumber(): number {
    return Math.floor(Math.random() * 100);
  }
}
