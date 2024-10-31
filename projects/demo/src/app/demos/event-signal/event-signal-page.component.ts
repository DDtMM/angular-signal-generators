import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { FromSignalDemoComponent } from './from-signal-demo/from-signal-demo.component';
import { FromStringLiteralDemoComponent } from './from-string-literal-demo/from-string-literal-demo.component';

@Component({
    selector: 'app-event-signal-page',
    imports: [
        CommonModule,
        DemoHostComponent,
        DemoPageHeaderComponent,
        FontAwesomeModule,
        FromSignalDemoComponent,
        FromStringLiteralDemoComponent
    ],
    template: `
<app-demo-page-header fnName="eventSignal" />
<p>
  Uses Angular's <a href="https://angular.dev/api/core/Renderer2" class="link">Renderer2</a> service to listen to events from DOM elements.
</p>
<p>
  Like the <i>listen</i> method it can accept an element or a string literal for <i>window</i>, <i>document</i> or <i>body</i>.
  Additionally, if an <i>ElementRef</i> is passed, the <i>nativeElement</i> property will be passed to the listener.
  As with most of the functions in this library, either a value, signal, function, or observable can be passed.
  This makes it handy to use with the <a href="https://angular.dev/api/core/viewChild" class="link">viewChild</a> query signal.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Events from a signal's element" pattern="event-signal/from-signal-demo/">
    <app-from-signal-demo />
  </app-demo-host>
  <app-demo-host name="Events from body element" pattern="event-signal/from-string-literal-demo/">
    <app-from-string-literal-demo />
  </app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventSignalPageComponent {}
