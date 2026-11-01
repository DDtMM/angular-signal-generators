import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { OnlineSignalDemoComponent } from '../../demos/online-signal/online-signal-demo/online-signal-demo.component';

@Component({
  selector: 'app-online-signal-page',
  imports: [DemoHostComponent, MemberPageHeaderComponent, OnlineSignalDemoComponent],
  template: `
<article class="doc-content">
<app-member-page-header fnName="onlineSignal" />
<p>
  Reports the browser's online status as a readonly signal. The initial value comes from
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine">navigator.onLine</a>,
  and the signal updates when the window receives an <code class="inline">online</code> or
  <code class="inline">offline</code> event.
</p>
<ul>
  <li><code class="inline">true</code>: the browser reports that it is online.</li>
  <li><code class="inline">false</code>: the browser reports that it is offline.</li>
  <li>
    <code class="inline">undefined</code>: the status is unknown, such as during server rendering when
    window or navigator is unavailable, or when navigator.onLine is not supported.
  </li>
</ul>
<app-demo-host name="Observing the browser's online status" pattern="online-signal/online-signal-demo/">
  <app-online-signal-demo />
</app-demo-host>
</article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineSignalPageComponent { }
