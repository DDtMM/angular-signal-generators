import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { ArrayDemoComponent } from './array-demo/array-demo.component';

@Component({
  selector: 'app-lift-signal-page',
  standalone: true,
  imports: [ArrayDemoComponent, DemoHostComponent, FaIconComponent, SignalHeaderComponent],
  template: `
<app-signal-header fnName="liftSignal"/>
<p>
  "Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.
  The lifted methods should be those appropriate for mutating or updating the value.
  For example, lifting <b>Array.push</b> will add a method called <i>push</i> to the signal.
  Calling the <i>push</i> method will internally call <b>signal.update()</b>
  with a function that executes the push and returns the updated signal.
</p>
<div role="alert" class="alert alert-warning">
  <fa-icon [icon]="faTriangleExclamation" class="text-info" />
  <div>
    <div> <b>Warning</b></div>
    <div>
      Signals and mutation don't mix.
      In order for mutators to work, objects are cloned
      either with <i>Object.Assign</i> or <i>structuredClone</i> so that a new object is actually created with every call.
      A new clone method can be specified if a more specific method is required.
    </div>
  </div>
</div>
<app-demo-host name="Lift methods from an array directly to signal"
  prefix="lift-signal/array-demo/array-demo.component"
  [sourceNames]="['.ts', '.html']">
  <app-array-demo />
</app-demo-host>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiftSignalPageComponent {
  readonly faTriangleExclamation = faTriangleExclamation;

}
