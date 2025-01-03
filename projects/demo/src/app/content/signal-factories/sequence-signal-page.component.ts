import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { FibonacciDemoComponent } from '../../demos/sequence-signal/fibonacci-demo/fibonacci-demo.component';
import { ToggleDemoComponent } from '../../demos/sequence-signal/toggle-demo/toggle-demo.component';


@Component({
    selector: 'app-timer-signal-page',
    imports: [DemoHostComponent, FibonacciDemoComponent, ToggleDemoComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="sequenceSignal" />
<p>
  This accepts a sequence of values, and moves to the next value after every call to next.
  The sequence can be something simple as a toggle between states, or a complex sequence generated by a function.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Simple Toggle" pattern="sequence-signal/toggle-demo/toggle-demo.component">
    <app-toggle-demo />
  </app-demo-host>
  <app-demo-host name="Generated Fibonacci Sequence" pattern="sequence-signal/fibonacci-demo/">
    <app-fibonacci-demo />
  </app-demo-host>
</div>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SequenceSignalPageComponent { }
