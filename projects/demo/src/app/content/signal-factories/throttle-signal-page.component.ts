import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { PointerDemoComponent } from '../../demos/throttle-signal/pointer-demo/pointer-demo.component';
import { SignalSourceDemoComponent } from '../../demos/throttle-signal/signal-source-demo/signal-source-demo.component';

@Component({
  selector: 'app-throttle-signal-page',
  imports: [DemoHostComponent, MemberPageHeaderComponent, PointerDemoComponent, SignalSourceDemoComponent],
  template: `
<app-member-page-header fnName="throttleSignal" />
<p>
  Limits how frequently changes are published. It accepts either a reactive source or an initial value,
  and supports leading, trailing, or combined emission behavior. The throttle time can also be a value or
  reactive source, allowing it to change while the signal is running.
</p>
<app-demo-host name="Throttled pointer position" pattern="throttle-signal/pointer-demo/">
  <app-throttle-pointer-demo />
</app-demo-host>
<app-demo-host name="Throttle a source signal" pattern="throttle-signal/signal-source-demo/">
  <app-throttle-signal-source-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThrottleSignalPageComponent {}
