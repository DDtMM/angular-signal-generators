import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { SearchHistoryDemoComponent } from '../../demos/reduce-signal/search-history-demo/search-history-demo.component';

@Component({
    selector: 'app-reduce-signal-page',
    imports: [DemoHostComponent, SearchHistoryDemoComponent, MemberPageHeaderComponent],
    template: `
<app-member-page-header fnName="reduceSignal" />
<p>
  Creates a signal similar to <code class="inline">Array.reduce</code> or Rxjs's <code class="inline">scan</code> operator. When
  the signal is set, the callback function is executed with the prior and currently set value as arguments, returning a new value.
</p>
<p>Like other reduce-like functions the value set to the signal does not have to be the same type returned from it.</p>
<app-demo-host name="Using Reduce Signal for Change History" pattern="reduce-signal/search-history-demo/">
  <app-search-history-demo />
</app-demo-host>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReduceSignalPageComponent {}
