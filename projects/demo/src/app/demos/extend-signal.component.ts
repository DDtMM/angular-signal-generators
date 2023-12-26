import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { extendSignal } from 'projects/signal-generators/src/public-api';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { SignalHeaderComponent } from '../controls/signal-header.component';

@Component({
  selector: 'app-extend-signal',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FaIconComponent, FormsModule, SignalHeaderComponent],
  template: `
<app-signal-header fnName="extendSignal" />
<p>
  Extends a signal by adding new methods directly to the signal.
  The original signal's methods can even be hidden.
  When implementing a new method, a proxy of the original signal will be passed (this could be the original signal if no method hiding occurs).
</p>
<p>
  This is essentially just a wrapper for <code class="inline p-1">Object.assign</code>.
  The <span class="italic">only</span> advantage over <code class="inline p-1">assign</code> is
    this allows you to hide the original implementation of the source signal's methods.
  For example, you can have a set method that multiplies a value and uses the original set to actually set the signal's value.
</p>
<p>
  If changing how a signal's original methods work isn't something you need, then just use
  <code class="inline p-1">Object.assign</code> or assign the functions directly.
</p>

<h3>Demo</h3>
<div class="flex flex-row flex-wrap -m-2">
  <div class="m-2">
    <input class="input" class="input input-bordered" type="text" [(ngModel)]="inputText" placeholder="Say something" />
  </div>
  <div class="m-2 join">
    <button type="button" class="btn btn-primary join-item" (click)="voice.whisper(inputText)">Whisper</button>
    <button type="button" class="btn btn-primary join-item" (click)="voice.yell(inputText)">Yell</button>
    <button type="button" class="btn btn-primary join-item" (click)="voice.clear()">Clear</button>
  </div>
</div>
<div>
  <label class="label">Result</label>
  {{voice() | json}}
</div>
<div>
  <h3>Example</h3>
  <app-example-code><pre>
readonly voice = extendSignal('hello', {{ '{' }}
  clear: (s) => s.set(''),
  whisper: (s, text) => s.set(\`(\${{ '{' }} text.toLowerCase() &#125;)\`),
  yell: (s, text: string) => s.set(\`\${{ '{' }} text.toUpperCase() &#125;!!!\`)
&#125;);
  </pre></app-example-code>
</div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendSignalComponent {
  inputText = '';

  readonly voice = extendSignal('hello', {
    clear: (s) => s.set(''),
    whisper: (s, text: string) => s.set(`(${text.toLowerCase()})`),
    yell: (s, text: string) => s.set(`${text.toUpperCase()}!!!`)
  });

}
