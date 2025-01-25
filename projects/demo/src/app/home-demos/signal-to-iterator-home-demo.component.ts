import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { HomeBoxComponent } from '../controls/home-box.component';


@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    template: `
<app-home-box fnName="signalToIterator">
  <div>
  This converts a signal into an AsyncIterator where is can be used in a <code class="inline">for async</code> loop.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
const source = signal('start');
for await (const item of signalToIterator(source)) &lbrace;
  console.log(item); // 'start', 'next'
&rbrace;
source.next('next');
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalToIteratorHomeDemoComponent {

}

