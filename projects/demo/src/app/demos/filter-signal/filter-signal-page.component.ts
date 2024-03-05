import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterSignal } from 'projects/signal-generators/src/public-api';
import { ExampleCodeComponent } from '../../controls/example-code.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { DemoHostComponent } from '../../controls/demo-host.component';
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
<app-demo-host name="Simple Input Filter" prefix="filter-signal/filter-text-demo/filter-text-demo.component"
  [sourceNames]="['.ts', '.html']">
  <app-filter-text-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSignalPageComponent {


}
