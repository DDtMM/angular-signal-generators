import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { ExtendSignalDemoComponent } from './extend-signal-demo/extend-signal-demo.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-extend-signal-page',
  standalone: true,
  imports: [CommonModule, DemoHostComponent, DemoPageHeaderComponent, ExtendSignalDemoComponent, FaIconComponent],
  template: `
<app-demo-page-header fnName="extendSignal" />
<p>
  Extends a signal by adding new methods directly to the signal.
  The original signal's methods can even be hidden.
  When implementing a new method, a proxy of the original signal will be passed (this could be the original signal if no method hiding occurs).
</p>
<div role="alert" class="alert alert-error mb-3">
  <fa-icon [icon]="faTriangleExclamation" />
  <div>
    <div> <b>This function is obsolete</b></div>
    <div>
      This function will be removed in a future version of this library.
      It was of limited use in Angular 16, and for Angular 17+ <code class="inline">signalSetFn</code> and
      <code class="inline">signalUpdateFn</code> can be used from Angular's signal primitives.
    </div>
  </div>
</div>
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
export class ExtendSignalPageComponent {
  readonly faTriangleExclamation = faTriangleExclamation;
}
