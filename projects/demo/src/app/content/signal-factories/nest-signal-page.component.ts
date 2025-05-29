import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { BasicDemoComponent } from '../../demos/nest-signal/basic-demo/basic-demo.component';

@Component({
    selector: 'app-nest-signal-page',
    imports: [BasicDemoComponent, DemoHostComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="nestSignal"/>
<p>
  Takes a value that contains one or more nested signals and emits their resolved values.
  Any type of value can be passed into it -
  As the signal will recursively traverse every property and element and replace any signal with its value after any change.
</p>
<div class="flex flex-col gap-6">
<app-demo-host name="Basic Usage" pattern="nest-signal/basic-demo/">
  <app-basic-demo />
</app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestSignalPageComponent { }
