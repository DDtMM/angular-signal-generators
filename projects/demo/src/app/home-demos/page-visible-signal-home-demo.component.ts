import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { PageVisibleSignalDemoComponent } from '../demos/page-visible-signal/page-visible-signal-demo/page-visible-signal-demo.component';

@Component({
  imports: [HomeBoxComponent, PageVisibleSignalDemoComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="pageVisibleSignal">
  <div>
    Reports whether the page is visible, or undefined when visibility is unknown.
  </div>
  <div class="divider">Example</div>
  <app-page-visible-signal-demo />
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageVisibleSignalHomeDemoComponent { }
