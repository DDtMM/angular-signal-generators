import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { EditorDemoComponent } from '../../demos/history-signal/editor-demo/editor-demo.component';
import { SourceDemoComponent } from '../../demos/history-signal/source-demo/source-demo.component';

@Component({
  selector: 'app-history-signal-page',
  imports: [DemoHostComponent, EditorDemoComponent, MemberPageHeaderComponent, SourceDemoComponent],
  template: `
<app-member-page-header fnName="historySignal" />
<p>
  Pass a value to create a writable signal, or pass a signal to record its observed values. Use <code class="inline">undo</code> and
  <code class="inline">redo</code> to navigate changes, and use the reactive
  <code class="inline">canUndo</code> and <code class="inline">canRedo</code> signals to drive controls.
</p>
<p>
  Source signals are observed by an Angular effect. Multiple synchronous emissions can therefore be coalesced,
  so intermediate values may not be added to history.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Writable undoable editor" pattern="history-signal/editor-demo/">
    <app-history-editor-demo />
  </app-demo-host>
  <app-demo-host name="Record another signal" pattern="history-signal/source-demo/">
    <app-history-source-demo />
  </app-demo-host>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorySignalPageComponent {}
