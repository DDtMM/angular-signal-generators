import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { MutationSignalDemoComponent } from './mutation-signal-demo/mutation-signal-demo.component';
import { DemoHostComponent } from '../../controls/demo-host.component';

@Component({
    selector: 'app-mutation-signal-page',
    imports: [CommonModule, DemoHostComponent, MutationSignalDemoComponent, DemoPageHeaderComponent],
    template: `
<app-demo-page-header fnName="mutationSignal" />
<p>
  Uses MutationObserver to observe changes to elements passed to the signal.
  All of the same options that can be passed to an IntersectionObserver can be passed to this signal.
</p>
<p>
  Like most other signal functions in this library, it can be passed a reference to an element or a signal that returns an element.
  This makes it convenient to use with Angular's <b>viewChild</b> signal.
</p>
<app-demo-host name="Viewing changes to an element's style" pattern="mutation-signal/mutation-signal-demo/">
  <app-mutation-signal-demo />
</app-demo-host>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutationSignalPageComponent { }
