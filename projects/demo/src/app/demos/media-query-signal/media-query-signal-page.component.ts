import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { MediaQuerySignalDemoComponent } from './media-query-signal-demo/media-query-signal-demo.component';

@Component({
  selector: 'app-media-query-signal-page',
  standalone: true,
  imports: [CommonModule, DemoHostComponent, DemoPageHeaderComponent, MediaQuerySignalDemoComponent],
  template: `
<app-demo-page-header fnName="mediaQuerySignal" />
<p>
  Takes a media query, and updates its value whenever the state of that query being matched changes.
  It does this by wrapping a call to <code class="inline">window.matchMedia</code>
  and listening to its <code class="inline">change</code> event.
</p>
<p>
  The value overload accepts a <code class="inline">manualDestroy</code> option.
  When it is <code class="inline">true</code> the signal does not have to be created in an injector context,
  but it is up to the developer to destroy it.

</p>
<app-demo-host name="Observing when an element is visible on an ancestor" pattern="media-query-signal/media-query-signal-demo/">
  <app-media-query-signal-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaQuerySignalPageComponent { }
