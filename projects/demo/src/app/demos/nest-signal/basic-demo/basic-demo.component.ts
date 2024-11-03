import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { nestSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-basic-demo',
    imports: [CommonModule, FormsModule],
    templateUrl: './basic-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');
  readonly $state = nestSignal({ name: this.$name, luckyNumbers: this.$luckyNumbers });

  addLuckyNumber() {
    this.$luckyNumbers.update(numbers => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach(x => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
