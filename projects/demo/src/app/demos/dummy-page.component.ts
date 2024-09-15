import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoPageHeaderComponent } from '../controls/demo-page-header.component';


@Component({
  selector: 'app-dummy-page',
  standalone: true,
  imports: [CommonModule, DemoPageHeaderComponent],
  template: `
<app-demo-page-header fnName="dummy" />
<p>
  This is a placeholder
</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DummyPageComponent { }
