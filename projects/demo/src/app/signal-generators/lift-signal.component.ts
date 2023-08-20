import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { liftSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from './signal-header.component';

@Component({
  selector: 'app-lift-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightModule, SignalHeaderComponent],
  template: `
<app-signal-header name="Lift Signal" apiPath="./api/functions/liftSignal.html" />
<p>
  "Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.
  The lifted methods should be those appropriate for mutating or updating the value.
  For example, lifting <b>Array.push</b> will add a method called <i>push</i> to the signal.
  Calling the <i>push</i> method will internally call <b>signal.mutate()</b> with a function that executes the push.
</p>
<div class="join pr-3">
  <button type="button" class="btn btn-primary join-item" (click)="numbers.push(randomNumber())">Push</button>
  <button type="button" class="btn btn-primary join-item" (click)="numbers.pop()">Pop</button>
  <button type="button" class="btn btn-primary join-item" (click)="numbers.shift()">Shift</button>
  <button type="button" class="btn btn-primary join-item" (click)="numbers.concat([randomNumber(), randomNumber()])">Concat</button>
</div>
<div>
  <label class="label">A Bunch of numbers</label>
  {{numbers() | json}}
</div>
<div>
  <h2>Example</h2>
  <pre><code [highlight]="example" [languages]="['typescript']"></code></pre>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiftSignalComponent {
  readonly example = `
numbers = liftSignal([this.randomNumber(), this.randomNumber(), this.randomNumber()], ['push', 'pop'], ['concat']);
randomNumber(): number { return Math.floor(Math.random() * 100); }
doSomething() {
  this.numbers.push(randomNumber());
}
  `.trim();
  readonly numbers = liftSignal([this.randomNumber(), this.randomNumber(), this.randomNumber()], ['push', 'pop', 'shift'], ['concat']);

  randomNumber(): number { return Math.floor(Math.random() * 100); }
}
