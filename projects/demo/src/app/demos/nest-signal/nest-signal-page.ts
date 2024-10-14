import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { BasicDemoComponent } from './basic-demo/basic-demo.component';

@Component({
  selector: 'app-nest-signal-page',
  standalone: true,
  imports: [BasicDemoComponent, DemoHostComponent, DemoPageHeaderComponent],
  template: `
<app-demo-page-header fnName="nestSignal"/>
<p>
  Takes a value that contains one or more nested signals and emits their resolved values.
  Any type of value can be passed into it.
  It will recursively traverse every property and element and replace any signal with its value after any change.
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
