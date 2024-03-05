import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { MathDemoComponent } from './math-demo/math-demo.component';

@Component({
  selector: 'app-map-signal-page',
  standalone: true,
  imports: [DemoHostComponent, MathDemoComponent, SignalHeaderComponent],
  template: `
<app-signal-header fnName="mapSignal" />
<p>
  This creates a signal whose input value is automatically mapped to an output value.
  The selector function can include signals or can be mapped directly from an array of signals.
</p>
<app-demo-host name="A Writable Mapped Signal and Map from other Signals"
  prefix="map-signal/math-demo/math-demo.component"
  [sourceNames]="['.ts', '.html']">
  <app-math-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSignalPageComponent { }
