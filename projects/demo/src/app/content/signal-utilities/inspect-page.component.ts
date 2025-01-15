import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { AltReporterDemoComponent } from '../../demos/inspect/alt-reporter-demo/alt-reporter-demo.component';
import { BasicDemoComponent } from '../../demos/inspect/basic-demo/basic-demo.component';
import { InspectComponentSignalsDemoComponent } from '../../demos/inspect/inspect-component-signals-demo/inspect-component-signals-demo.component';

@Component({
    selector: 'app-inspect-page',
    imports: [AltReporterDemoComponent, BasicDemoComponent, DemoHostComponent, MemberPageHeaderComponent, InspectComponentSignalsDemoComponent],
    template: `
<app-member-page-header fnName="inspect"/>
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
  <p>
    You'll need to see the browser's console to see output of inspect.
  </p>
  <app-basic-demo />
</app-demo-host>
<app-demo-host name="Using Inspect with a Custom Reporter" pattern="inspect/alt-reporter-demo/">
  <p>
    In this demo the custom reporter can be disabled by a signal and the output formatting stands out.
    You'll need to see the browser's console to see output of inspect.
  </p>
  <app-alt-reporter-demo />
</app-demo-host>
<app-demo-host  name="The easy way to inspect all signals on a component" pattern="inspect/inspect-component-signals-demo/">
  <p>
    In this demo the entire state of the component is inspected by calling 
    <code class="inline">inspect(this)</code>.
    You'll need to see the browser's console to see output of inspect.
  </p>
  <app-inspect-component-signals-demo />
</app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectPageComponent { }
