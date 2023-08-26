import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { extendSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from './signal-header.component';

@Component({
  selector: 'app-lift-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightModule, SignalHeaderComponent],
  template: `
<app-signal-header name="Extend Signal" apiPath="./api/functions/extendSignal.html" />
<p>
  Extends a signal by adding new methods directly to the signal.
  The original signal's methods can even be hidden.
  When implementing a new method, a proxy of the original signal will be passed (this could be the original signal if no method hiding occurs).
</p>
<p>
  This is essentially just a wrapper for <code class="inline p-1">Object.assign</code>.
  The advantage over <code class="inline p-1">assign</code> is that this allows you to hide the original implementation of the source signal's methods.
  For example, you can have a set method that multiplies a value and uses the original set to actually set the signal's value.
</p>
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
  <h2>Example</h2>
  <pre><code [highlight]="example" [languages]="['typescript']"></code></pre>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendSignalComponent {
  readonly example = `
readonly voice = extendSignal('hello', {
  clear: (s) => s.set(''),
  whisper: (s, text) => s.set(\`(\${text.toLowerCase()})\`),
  yell: (s, text: string) => s.set(\`\${text.toUpperCase()}!!!\`)
});
  `.trim();

  inputText = '';

  readonly voice = extendSignal('hello', {
    clear: (s) => s.set(''),
    whisper: (s, text: string) => s.set(`(${text.toLowerCase()})`),
    yell: (s, text: string) => s.set(`${text.toUpperCase()}!!!`)
  });

}
