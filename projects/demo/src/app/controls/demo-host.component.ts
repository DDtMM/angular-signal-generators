import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { default as sources } from '../../assets/demos-sources';
import { HighlightModule } from 'ngx-highlightjs';
import { CommonModule } from '@angular/common';
import { mapSignal } from 'projects/signal-generators/src/public-api';

type SourceType = 'html' | 'typescript' | 'unknown';

/** Renders a demo with sources.  The demo component should be passed as content. */
@Component({
  selector: 'app-demo-host',
  standalone: true,
  imports: [CommonModule, HighlightModule],
  template: `
  <div class="mx-1 mb-1 text-xl text-secondary">{{$name()}}</div>
  <div role="tablist" class="tabs tabs-lifted w-full  ">
    <button role="tab" class="tab [--tab-bg:#F8FAFC]"
        [ngClass]="{ 'tab-active': $selectedTabType() === 'demo'}"
        (click)="$selectedTabType.set('demo')">
        Demo
    </button>
    @if ($selectedTabType() === 'demo') {
      <div role="tab" class="tab-content border-base-300 bg-slate-50 rounded-box rounded-tl-none p-3 shadow-lg">
        <ng-content />
      </div>
    }
    @for (source of $sources(); track source.name) {
      <button role="tab" class="tab [--tab-bg:#F8FAFC]"
        [ngClass]="{ 'tab-active': $selectedTabType() === source.type}"
        (click)="$selectedTabType.set(source.type)">
        {{typeLabels[source.type]}}
      </button>
      @if ($selectedTabType() === source.type) {
        <div class="tab-content border-base-300 bg-slate-50 whitespace-pre-wrap w-full max-h-[400px] overflow-auto rounded-box shadow-lg ">
          <code class="h-full w-full bg-slate-50 " [highlight]="source.code" [languages]="[source.type]"></code>
        </div>
      }
    }
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoHostComponent {

  /** Displayed name of demo. */
  readonly $name = input.required<string>({ alias: 'name' });
  /** Currently visible tab */
  readonly $selectedTabType = signal<SourceType | 'demo'>('demo');
  /** Prefix that is common to all sourceNames. */
  readonly $sourcePrefix = input('', { alias: 'prefix' });
  readonly $sources = computed(() => {
    const prefix = this.$sourcePrefix();
    return this.$sourceNames()
      .map(sourceName => {
        const fullName = `${prefix}${sourceName}`;
        if (Object.hasOwn(sources, fullName)) {
          return {
            code: sources[fullName as keyof typeof sources],
            name: sourceName.substring(Math.min(sourceName.lastIndexOf('/'), 0)),
            type: getSourceType(sourceName)
          };
        }
        return undefined;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  });
  readonly $sourceNames = input<string[]>([], { alias: 'sourceNames'});

  readonly typeLabels = {
    'html': 'HTML',
    'typescript': 'TypeScript',
    'unknown': 'Unknown'
  } satisfies Record<SourceType, string>;
  readonly $visibleSource = mapSignal(this.$selectedTabType, this.$sources,
    (tabType, sources) => sources.length && tabType !== 'demo' ? sources.find(x => x.type === tabType) : undefined);
}

function getSourceType(sourceName: string): SourceType {
  const ext = sourceName.substring(sourceName.lastIndexOf('.') + 1);
  switch (ext) {
    case 'html': return 'html';
    case 'ts': return 'typescript';
    default: return 'unknown';
  }
}
