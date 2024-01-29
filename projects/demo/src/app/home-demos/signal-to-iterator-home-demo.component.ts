import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';


@Component({
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent],
  template: `
<app-home-box fnName="signalToIterator">
  <div>
  This converts a signal into an AsyncIterator where is can be used in a <code class="inline p-1">for async</code> loop.
  </div>
  <div class="divider">Example</div>
  <app-example-code><pre>
const source = signal('start');
for await (const item of signalToIterator(source)) &lbrace;
  console.log(item); // 'start', 'next'
&rbrace;
source.next('next');
</pre></app-example-code>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalToIteratorHomeDemoComponent {

}

