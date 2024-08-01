import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { FromSignalDemoComponent } from '../demos/event-signal/from-signal-demo/from-signal-demo.component';


@Component({
  standalone: true,
  imports: [HomeBoxComponent, FromSignalDemoComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="eventSignal">
      <div>Listens to DOM Events</div>
      <div class="divider">Example</div>
      <app-from-signal-demo />
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSignalHomeDemoComponent { }
