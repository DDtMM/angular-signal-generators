
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';


@Component({
  selector: 'app-dummy-page',
  imports: [MemberPageHeaderComponent],
  template: `
<app-member-page-header fnName="dummy" />
<p>
  This is a placeholder
</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DummyPageComponent { }
