import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { liftSignal } from 'projects/signal-generators/src/public-api';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { SignalHeaderComponent } from '../controls/signal-header.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-lift-signal',
  standalone: true,
  imports: [CommonModule, FaIconComponent, HighlightModule, SignalHeaderComponent],
  template: `
<app-signal-header name="Lift Signal" apiPath="./api/functions/liftSignal.html" [types]="['generator', 'signal']" />
<p>
  "Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.
  The lifted methods should be those appropriate for mutating or updating the value.
  For example, lifting <b>Array.push</b> will add a method called <i>push</i> to the signal.
  Calling the <i>push</i> method will internally call <b>signal.update()</b>
  with a function that executes the push and returns the updated signal.
</p>
<div role="alert" class="alert alert-warning">
  <fa-icon [icon]="faTriangleExclamation" class="text-info" />
  <div>
    <div> <b>Warning</b></div>
    <div>
      Signals and mutation don't mix.
      In order for mutators to work, objects are cloned
      either with <i>Object.Assign</i> or <i>structuredClone</i> so that a new object is actually created with every call.
    </div>
  </div>
</div>
<h3>Demo</h3>
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
  <h3>Example</h3>
  <pre><code [highlight]="example" [languages]="['typescript']"></code></pre>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiftSignalComponent {
  readonly example = `
numbers = liftSignal([this.randomNumber(), this.randomNumber(), this.randomNumber()], ['concat'], ['push', 'pop']);
randomNumber(): number { return Math.floor(Math.random() * 100); }
doSomething() {
  this.numbers.push(randomNumber());
}
  `.trim();
  readonly faTriangleExclamation = faTriangleExclamation;
  readonly numbers = liftSignal([this.randomNumber(), this.randomNumber(), this.randomNumber()], ['concat'], ['push', 'pop', 'shift']);

  randomNumber(): number { return Math.floor(Math.random() * 100); }
}
