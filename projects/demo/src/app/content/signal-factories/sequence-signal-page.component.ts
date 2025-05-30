import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { FibonacciDemoComponent } from '../../demos/sequence-signal/fibonacci-demo/fibonacci-demo.component';
import { ToggleDemoComponent } from '../../demos/sequence-signal/toggle-demo/toggle-demo.component';
import { ChoicesDemoComponent } from '../../demos/sequence-signal/choices-demo/choices-demo.component';


@Component({
    selector: 'app-timer-signal-page',
    imports: [ChoicesDemoComponent, DemoHostComponent, FibonacciDemoComponent, ToggleDemoComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="sequenceSignal" />
<p>
  This accepts a sequence of values, and moves to the next value after every call to next.
  The sequence can be something as simple as an array of two values to toggle between states, 
  or as complex as a sequence generated by a function.
</p>
<p>
  This signal can accept anything that implements the <code class="inline">Iterator</code> spec or that matches the <code class="inline">ArrayLike</code> interface.
  A special type called <code class="inline">Cursor</code> can also be provided to allow more custom behavior.
  This type is very similar to an <code class="inline">Iterator</code>, but has explicit methods to reset and move to specific values.
</p>
<p>
  This signal has <code class="inline">set</code> and <code class="inline">update</code> methods like any writeable signal.
  These methods will throw errors if the values aren't present in the sequence.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Simple Toggle" pattern="sequence-signal/toggle-demo/toggle-demo.component">
    You can avoid using any template expressions or functions when toggling values with <i>sequenceSignal</i>.
    <app-toggle-demo />
  </app-demo-host>
  <app-demo-host name="Generated Fibonacci Sequence" pattern="sequence-signal/fibonacci-demo/">
    <p>This uses an iterator to move through a sequence of fibonacci numbers.</p>
    <app-fibonacci-demo />
  </app-demo-host>
  <app-demo-host name="Choices with Model Binding" pattern="sequence-signal/choices-demo/choices-demo.component">
    <p>This will use a radio button to select a choice, and will update the model binding to the selected choice.</p>
    <app-choices-demo />
  </app-demo-host>
</div>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SequenceSignalPageComponent { }
