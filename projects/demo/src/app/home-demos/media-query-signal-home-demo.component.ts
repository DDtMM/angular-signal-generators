import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { MediaQuerySignalDemoComponent } from '../demos/media-query-signal/media-query-signal-demo/media-query-signal-demo.component';


@Component({
  standalone: true,
  imports: [HomeBoxComponent, MediaQuerySignalDemoComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="mediaQuerySignal">
  <div>
    Takes a media query, and updates its value whenever the state of that query being matched changes.
  </div>
  <div class="divider">Example</div>
  <app-media-query-signal-demo />
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaQuerySignalHomeDemoComponent { }
