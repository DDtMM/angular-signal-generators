
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { ResizeSignalDemoComponent } from '../../demos/resize-signal/resize-signal-demo/resize-signal-demo.component';
import { DemoHostComponent } from '../../controls/demo-host.component';

@Component({
    selector: 'app-resize-signal-page',
    imports: [DemoHostComponent, ResizeSignalDemoComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="resizeSignal" />
<p>
  Uses ResizeObserver to observe changes to elements passed to the signal.
  All of the same options that can be passed to an IntersectionObserver can be passed to this signal.
</p>
<p>
  Like most other signal functions in this library, it can be passed a reference to an element or a signal that returns an element.
  This makes it convenient to use with Angular's <b>viewChild</b> signal.
</p>
<app-demo-host name="Observing size changes" pattern="resize-signal/resize-signal-demo/">
  <app-resize-signal-demo />
</app-demo-host>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeSignalPageComponent { }
