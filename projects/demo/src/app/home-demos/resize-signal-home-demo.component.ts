import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ResizeSignalDemoComponent } from '../demos/resize-signal/resize-signal-demo/resize-signal-demo.component';

@Component({
    imports: [HomeBoxComponent, ResizeSignalDemoComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="resizeSignal">
  <div>
  Wraps ResizeObserver so changes made to the dimensions of an element can be observed.
  </div>
  <div class="divider">Example</div>
  <app-resize-signal-demo />
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeSignalHomeDemoComponent {}
