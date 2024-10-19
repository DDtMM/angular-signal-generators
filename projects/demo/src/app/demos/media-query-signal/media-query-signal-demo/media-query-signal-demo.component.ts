import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { mediaQuerySignal, MediaQueryState } from '@ddtmm/angular-signal-generators';

interface QueryOption {
  formatFn: (value: MediaQueryState) => string;
  label: string;
  query: string;
  queryType: 'minWidth' | 'orientation';
}
@Component({
  selector: 'app-media-query-signal-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-query-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaQuerySignalDemoComponent {
  readonly queries = [
    {
      formatFn: (x) => `Orientation: ${x.matches ? 'Portrait' : 'Landscape'}`,
      label: 'Orientation',
      query: '(orientation: portrait)',
      queryType: 'orientation'
    },
    {
      formatFn: (x) => `${x.matches ? 'Greater Than' : 'Less Than'} 600px`,
      label: 'Min Width',
      query: '(min-width: 600px)',
      queryType: 'minWidth'
    }
  ] satisfies QueryOption[];

  readonly $query = signal<QueryOption>(this.queries[0]);
  readonly $matchMedia = mediaQuerySignal(() => this.$query().query);
  readonly $report = computed(() => this.$query().formatFn(this.$matchMedia()));
}
