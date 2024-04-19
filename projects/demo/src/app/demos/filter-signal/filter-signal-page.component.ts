import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { FilterTextDemoComponent } from './filter-text-demo/filter-text-demo.component';

@Component({
  selector: 'app-filter-signal-page',
  standalone: true,
  imports: [DemoHostComponent, FilterTextDemoComponent, SignalHeaderComponent],
  template: `
<app-signal-header fnName="filterSignal" />
<p>
  Filters values set to this signal directly upon the result of a filter function.
  The filter function can be a guard function, changing the return type from the source type of the signal.
</p>
<app-demo-host name="Simple Input Filter" pattern="filter-signal/filter-text-demo/">
  <app-filter-text-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSignalPageComponent {


}
