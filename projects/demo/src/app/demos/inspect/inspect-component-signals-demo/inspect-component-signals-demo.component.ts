import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inspect } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-inspect-component-signals-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspect-component-signals-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectComponentSignalsDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');

  constructor() {
    /** This is the easiest way to use this! */
    inspect(this);
    afterNextRender(() => Array(3).fill(0).forEach(() => this.addLuckyNumber()));
  }
  addLuckyNumber() {
    this.$luckyNumbers.update(numbers => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach(x => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
