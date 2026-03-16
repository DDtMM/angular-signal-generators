import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { FakeResourceDemoComponent } from '../../demos/resource-ref-to-promise/fake-resource-demo/fake-resource-demo.component';

@Component({
  selector: 'app-resource-ref-to-promise-page',
  imports: [DemoHostComponent, FakeResourceDemoComponent, MemberPageHeaderComponent],
  template: `
<app-member-page-header fnName="resourceRefToPromise" />
<p>
  Converts a resource reference into a promise that resolves when loading completes, or rejects if the resource errors.
</p>
<p>
  This is useful when you need to compose resource loading with promise-based workflows.
</p>
<app-demo-host name="Delayed Fake Resource" pattern="resource-ref-to-promise/fake-resource-demo/">
  <p>
    This demo uses fake resources backed by signals and delayed with <code class="inline">setTimeout</code>.
    Run both success and error cases to see how <code class="inline">resourceRefToPromise</code> behaves.
  </p>
  <app-fake-resource-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceRefToPromisePageComponent {}
