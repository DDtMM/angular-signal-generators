import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { OnlineSignalDemoComponent } from '../demos/online-signal/online-signal-demo/online-signal-demo.component';

@Component({
  imports: [HomeBoxComponent, OnlineSignalDemoComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="onlineSignal">
  <div>
    Reports the browser's online status, or undefined when the status is unknown.
  </div>
  <div class="divider">Example</div>
  <app-online-signal-demo />
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineSignalHomeDemoComponent { }
