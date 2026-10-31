
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { MutationSignalDemoComponent } from '../../demos/mutation-signal/mutation-signal-demo/mutation-signal-demo.component';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { ChildElementDemoComponent } from '../../demos/mutation-signal/child-element-demo/child-element-demo.component';

@Component({
    selector: 'app-mutation-signal-page',
    imports: [DemoHostComponent, MutationSignalDemoComponent, ChildElementDemoComponent, MemberPageHeaderComponent],
    template: `
<article class="doc-content">
<app-member-page-header fnName="mutationSignal" />
<p>
  Uses MutationObserver to observe changes to elements passed to the signal.
  All of the same options that can be passed to a MutationObserver can be passed to this signal.
</p>
<p>
  Like most other signal functions in this library, it can be passed a reference to an element or a signal that returns an element.
  This makes it convenient to use with Angular's <b>viewChild</b> signal.
</p>
<app-demo-host name="Viewing changes to an element's style" pattern="mutation-signal/mutation-signal-demo/">
  <app-mutation-signal-demo />
</app-demo-host>
<p class="mt-3">
  To detect when a particular child element is added or removed, pass <b>childList: true</b>.
  Add <b>subtree: true</b> to also watch nested descendants, as shown below.
</p>
<app-demo-host name="Detecting when a child element exists" pattern="mutation-signal/child-element-demo/">
  <app-child-element-demo />
</app-demo-host>
</article>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutationSignalPageComponent { }
