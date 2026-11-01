import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { PageVisibleSignalDemoComponent } from '../../demos/page-visible-signal/page-visible-signal-demo/page-visible-signal-demo.component';

@Component({
  selector: 'app-page-visible-signal-page',
  imports: [DemoHostComponent, MemberPageHeaderComponent, PageVisibleSignalDemoComponent],
  template: `
<article class="doc-content">
<app-member-page-header fnName="pageVisibleSignal" />
<p>
  Reports whether the page is visible as a readonly signal. The initial value comes from
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState">document.visibilityState</a>,
  and the signal updates when the document receives a <code class="inline">visibilitychange</code> event.
</p>
<ul>
  <li><code class="inline">true</code>: the document's visibility state is visible.</li>
  <li><code class="inline">false</code>: the document's visibility state is hidden.</li>
  <li>
    <code class="inline">undefined</code>: the status is unknown, such as during server rendering when
    document is unavailable, or when document.visibilityState is not supported.
  </li>
</ul>
<app-demo-host name="Pausing audio when the page is hidden"
  pattern="page-visible-signal/(page-visible-signal-demo|shared)/"
  primaryComponentPattern="component\\.ts" hiddenPattern="page-visible-demo-audio">
  <app-page-visible-signal-demo />
</app-demo-host>
</article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageVisibleSignalPageComponent { }
