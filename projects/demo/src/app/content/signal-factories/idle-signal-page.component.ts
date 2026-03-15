import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { IdleSignalDemoComponent } from '../../demos/idle-signal/idle-signal-demo/idle-signal-demo.component';

@Component({
  selector: 'app-idle-signal-page',
  imports: [DemoHostComponent, MemberPageHeaderComponent, IdleSignalDemoComponent],
  template: `
<app-member-page-header fnName="idleSignal" />
<p>
  A signal that detects user idle state by monitoring browser events (mousedown, mousemove, keydown, scroll, touchstart, click).
</p>
<p>
  The signal returns an object containing:
</p>
<ul class="list-disc list-inside ml-4">
  <li><code>isIdle</code>: Whether the user is currently idle</li>
  <li><code>timeSinceLastChange</code>: Time in milliseconds since the last state change</li>
  <li><code>changeReason</code>: The reason for the last change ('idling', 'active', or event name)</li>
</ul>
<p>
  The signal automatically cleans up all listeners when destroyed, making it safe to use in components.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Idle Detection Demo" pattern="idle-signal/idle-signal-demo/">
    <p>
      This demo shows how the idle signal detects user activity and idle state.
      You can configure the idle timeout and detection mode.
    </p>
    <app-idle-signal-demo />
  </app-demo-host>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdleSignalPageComponent {

}
