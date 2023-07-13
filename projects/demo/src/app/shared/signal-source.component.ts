import { ChangeDetectionStrategy, Component, Input, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-source',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="flex">
  <label for="interval">Interval</label>
  <input id="interval" type="range" min="0" max="60000" [ngModel]="interval()" (ngModelChange)="interval.set($event)"  />
<div>
<div>
  <div>Current Value</div>
  <div>{{currentValue()}}</div>
<div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalSourceComponent {
  readonly currentIndex = signal<number>(-1);
  readonly currentValue = computed(() => this.values()[this.currentIndex()]);

  readonly interval = signal(1000);

  @Input('interval')
  set intervalSetter(value: number) {
    this.interval.set(value);
  }

  readonly remainingValues = computed(() => this.values().slice(this.currentIndex() + 1));

  readonly values = signal<unknown[]>([]);
  @Input('values')
  set valuesSetter(value: unknown[]) {
    this.values.set(value);
  }

  constructor() {
    effect((onCleanup) => {
      const intervalId = setInterval(() => {
        let nextIndex = this.currentIndex() + 1;
        const values = this.values();
        if (nextIndex >= values.length) {
          clearInterval(intervalId); // out of values.
        } else {
          //this.currentValue.set(values[currentIndex]);
        }
      }, this.interval());
      onCleanup(() => clearInterval(intervalId));
    }, { allowSignalWrites: true })
  }
}
