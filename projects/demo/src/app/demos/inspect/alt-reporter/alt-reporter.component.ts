import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inspect, sequenceSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-alt-reporter-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alt-reporter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AltReporterComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');
  readonly $loggingEnabled = sequenceSignal([true, false]);
  constructor() {
    inspect({ enabled: this.$loggingEnabled, luckyNumbers: this.$luckyNumbers, name: this.$name }, {
      reporter: (subject) => {
        if (subject.enabled) {
          console.log(`%cCHANGE\n%o`, 'color: red; background: yellow', subject);
        }
      },
      runInProdMode: true,
      skipInitial: true
    });
    afterNextRender(() => Array(3).fill(0).forEach(() => this.addLuckyNumber()));
  }
  addLuckyNumber() {
    this.$luckyNumbers.update(numbers => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach(x => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
