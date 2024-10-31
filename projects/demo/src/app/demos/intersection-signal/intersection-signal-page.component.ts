import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { IntersectionSignalDemoComponent } from './intersection-signal-demo/intersection-signal-demo.component';
import { DemoHostComponent } from '../../controls/demo-host.component';

@Component({
    selector: 'app-intersection-signal-page',
    imports: [CommonModule, DemoHostComponent, IntersectionSignalDemoComponent, DemoPageHeaderComponent],
    template: `
<app-demo-page-header fnName="intersectionSignal" />
<p>
  Uses IntersectionObserver to observe changes to elements passed to the signal.
  All of the same options that can be passed to an IntersectionObserver can be passed to this signal.
</p>
<p>
  Like most other signal functions in this library, it can be passed a reference to an element or a signal that returns an element.
  This makes it convenient to use with Angular's <b>viewChild</b> signal.
</p>
<app-demo-host name="Observing when an element is visible on an ancestor" pattern="intersection-signal/intersection-signal-demo/">
  <app-intersection-signal-demo />
</app-demo-host>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntersectionSignalPageComponent { }
