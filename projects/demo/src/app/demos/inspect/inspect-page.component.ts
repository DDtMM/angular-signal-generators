import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { BasicDemoComponent } from './basic-demo/basic-demo.component';
import { AltReporterDemoComponent } from './alt-reporter-demo/alt-reporter-demo.component';

@Component({
  selector: 'inspect-page',
  standalone: true,
  imports: [AltReporterDemoComponent, BasicDemoComponent, DemoHostComponent, DemoPageHeaderComponent],
  template: `
<app-demo-page-header fnName="inspect"/>
<p>
Reports the latest state of a subject by resolving all the values deeply contained within by using <a href="./nestSignal">nestSignal</a>.
By default the output is generated using a <code class="inline">console.log</code>, but this can be changed with the <code class="inline">reporter</code> option.
The Subject can be anything, but to be effective it should be a signal, an object that contains signals, or an array of signals.
</p>
<p>
  The <b>inspect</b> function will only output changes when the application is in development mode.  In production mode, it will do nothing.
  You can change this and other behaviors from the function's options or by modifying modifying values in <code class="inline">INSPECT_DEFAULTS</code>.
  Changing this will affect all instances of <code class="inline">inspect</code>.
</p>
<div class="flex flex-col gap-6">
<app-demo-host name="Basic Usage" pattern="inspect/basic-demo/">
  <app-basic-demo />
</app-demo-host>
<app-demo-host name="Using Inspect with a Custom Reporter" pattern="inspect/alt-reporter-demo/">
  <app-alt-reporter-demo />
</app-demo-host>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectPageComponent { }
