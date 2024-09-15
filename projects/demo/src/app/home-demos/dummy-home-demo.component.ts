import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeBoxComponent } from '../controls/home-box.component';


@Component({
  standalone: true,
  imports: [HomeBoxComponent],
  template: `
<app-home-box fnName="dummy">
  <div>
    This is a placeholder
  </div>
  <div class="divider">Example</div>
  <span>No example available.</span>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DummyHomeDemoComponent { }

