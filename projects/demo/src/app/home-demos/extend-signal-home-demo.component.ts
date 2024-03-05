import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ExtendSignalDemoComponent } from '../demos/extend-signal/extend-signal-demo/extend-signal-demo.component';

@Component({
  standalone: true,
  imports: [HomeBoxComponent, ExtendSignalDemoComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="extendSignal">
      <div>Adds new methods to an existing signal.</div>
      <div class="divider">Example</div>
      <app-extend-signal-demo />
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendSignalHomeDemoComponent { }
