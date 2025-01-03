import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';


@Component({
    selector: 'app-signal-to-iterator-page',
    imports: [CommonModule, HighlightModule, MemberPageHeaderComponent],
    template: `
<!-- for some reason the API docs come out with -1 at the end -->
<app-member-page-header fnName="signalToIterator" />
<p>
  This converts a signal into an AsyncIterator.
  The emissions from the signal will build up, and then released each time next is called.
  The iterator can be used in a <code class="inline">for async</code> loop.
  This uses an effect under the hood, so be sure to pass injector if it isn't created in the constructor.
</p>
<div>
  <h3>Example</h3>
  <pre><code [highlight]="simpleExample" language="typescript"></code></pre>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalToIteratorPageComponent {
  readonly simpleExample = `const source = signal('start');
// if not in constructor then pass injectorRef.
for await (const item of signalToIterator(source, { injector: this.injectorRef })) {
  console.log(item); // 'start', 'next'...
}
const source = signal('next');
`
}

