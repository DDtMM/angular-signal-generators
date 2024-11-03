import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { BuiltInStorageDemoComponent } from '../../demos/storage-signal/built-in-storage-demo/built-in-storage-demo.component';
import { CustomStorageDemoComponent } from '../../demos/storage-signal/custom-storage-demo/custom-storage-demo.component';

@Component({
    selector: 'app-storage-signal-page',
    imports: [BuiltInStorageDemoComponent, CustomStorageDemoComponent, DemoHostComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="storageSignal" />
<p>
A signal that uses a secondary storage system to store values, ideally beyond the lifetime of the application.
When the signal is initialized it will check the store for an existing value and fallback to the initialValue if it wasn't present.
</p>
<p>
The <b>storageSignal</b> implementation requires a store to be specified,
but two built-in implementations exist: <b>localStorageSignal</b> and <b>sessionStorageSignal</b>.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Built-in Browser Storage Signal with Custom Serialization" pattern="storage-signal/built-in-storage-demo">
    <app-built-in-storage-demo />
  </app-demo-host>
  <app-demo-host name="Custom Storage Example" pattern="storage-signal/custom-storage-demo">
    <app-custom-storage-demo />
  </app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageSignalPageComponent { }
