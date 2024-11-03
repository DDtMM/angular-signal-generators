import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inspect, sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-alt-reporter-demo',
    imports: [CommonModule, FormsModule],
    templateUrl: './alt-reporter-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AltReporterDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');
  readonly $loggingEnabled = sequenceSignal([true, false]);
  constructor() {
    inspect(
      { enabled: this.$loggingEnabled, luckyNumbers: this.$luckyNumbers, name: this.$name },
      {
        reporter: (subject) => subject.enabled && console.log(`%cCHANGE\n%o`, 'color: red; background: yellow', subject),
        runInProdMode: true,
        skipInitial: true
      }
    );
    afterNextRender(() => Array(3).fill(0).forEach(() => this.addLuckyNumber()));
  }
  addLuckyNumber() {
    this.$luckyNumbers.update((numbers) => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach((x) => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
