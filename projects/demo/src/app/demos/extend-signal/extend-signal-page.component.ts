import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { ExtendSignalDemoComponent } from './extend-signal-demo/extend-signal-demo.component';
import { DemoHostComponent } from '../../controls/demo-host.component';

@Component({
  selector: 'app-extend-signal-page',
  standalone: true,
  imports: [CommonModule, DemoHostComponent, ExtendSignalDemoComponent, SignalHeaderComponent],
  template: `
<app-signal-header fnName="extendSignal" />
<p>
  Extends a signal by adding new methods directly to the signal.
  The original signal's methods can even be hidden.
  When implementing a new method, a proxy of the original signal will be passed (this could be the original signal if no method hiding occurs).
</p>
<p>
  This is essentially just a wrapper for <code class="inline">Object.assign</code>.
  The <span class="italic">only</span> advantage over <code class="inline">assign</code> is
    this allows you to hide the original implementation of the source signal's methods.
  For example, you can have a set method that multiplies a value and uses the original set to actually set the signal's value.
</p>
<p>
  If changing how a signal's original methods work isn't something you need, then just use
  <code class="inline">Object.assign</code> or assign the functions directly.
</p>
<app-demo-host name="Signal with specialized setters" pattern="extend-signal/extend-signal-demo/">
  <app-extend-signal-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendSignalPageComponent { }
