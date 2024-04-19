import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { mapSignal } from 'projects/signal-generators/src/public-api';
import { DemoService, SourceFile } from '../services/demo.service';
import { CopyButtonComponent } from './copy-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


interface DemoHostSourceFile extends SourceFile {
  label: string;
  id: string | number;
}
/** Renders a demo with sources.  The demo component should be passed as content. */
@Component({
  selector: 'app-demo-host',
  standalone: true,
  imports: [CopyButtonComponent, CommonModule, FontAwesomeModule, HighlightModule],
  template: `
  <div class="flex flex-row gap-3">
    <div class="mx-1 mb-1 text-xl text-secondary">{{$name()}}</div>
    <button type="button" class="btn btn-secondary btn-outline btn-sm" (click)="openProject()" title="Open in StackBlitz">
      <img class="w-4" alt="Open in StackBlitz" src="assets/stackblitz-icon.svg"/>
      <span class="hidden sm:inline">StackBlitz</span>
    </button>
  </div>
  <div role="tablist" class="tabs tabs-lifted w-full  ">
    <button role="tab" class="tab [--tab-bg:#F8FAFC]"
        [ngClass]="{ 'tab-active': $selectedTab() === demoTabId}"
        (click)="$selectedTab.set(demoTabId)">
        Demo
    </button>
    @if ($selectedTab() === demoTabId) {
      <div role="tab" class="tab-content border-base-300 bg-slate-50 rounded-box rounded-tl-none p-3 shadow-lg">
        <ng-content />
      </div>
    }
    @for (source of $sources(); track source.name) {
      <button role="tab" class="tab [--tab-bg:#F8FAFC]"
        [ngClass]="{ 'tab-active': $selectedTab() === source.id}"
        (click)="$selectedTab.set(source.id)">
        {{source.label}}
      </button>
      @if ($selectedTab() === source.id) {
        <div class="relative tab-content border-base-300 bg-slate-50 whitespace-pre-wrap w-full max-h-[400px] overflow-auto rounded-box shadow-lg ">
          <span class="absolute right-0 p-1">
            <app-copy-button [content]="source.code" />
          </span>
          <code class="h-full w-full bg-slate-50 " [highlight]="source.code" [languages]="[source.type]"></code>
        </div>
      }
    }
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoHostComponent {
  private readonly demoSvc = inject(DemoService);

  readonly demoTabId = '_demo_';
  /** Displayed name of demo. */
  readonly $name = input.required<string>({ alias: 'name' });
  /** A string that will be used to construct a regex to match the source names */
  readonly $pattern = input.required<string>({ alias: 'pattern' });
  /** Optional input to detect primary component.  If not passed then the first typescript file is used. */
  readonly $primaryComponentPattern = input<string | undefined>(undefined, { alias: 'primaryComponentPattern' });
  /** Currently visible tab */
  readonly $selectedTab = signal<string | number>(this.demoTabId);
  /** All source files relevant to the demo. */
  readonly $sources = computed<DemoHostSourceFile[]>(() => {
    const sourceFilesMatcher = new RegExp(this.$pattern());
    const primaryComponentFinder = this.$primaryComponentFinder();
    const sourceFiles = this.demoSvc.getSourceFiles(sourceFilesMatcher);
    const uiSourceFiles = sourceFiles.map((x, i) => ({
      ...x,
      /** It is shorter to use the file type, but if sources are too many then the file names are used. */
      label: sourceFiles.length <= 2 ? this.typeLabels[x.type] || x.name : x.name,
      id: i
    }));
    const primaryComponentFile = uiSourceFiles.find(primaryComponentFinder);
    if (primaryComponentFile) {
      const primaryComponentFileNameSansExtension = primaryComponentFile.name.substring(0, primaryComponentFile.name.lastIndexOf('.'));
      uiSourceFiles.sort((a, b) => {
        // check if primary component file take priority in case b is the primary component file
        if (a === primaryComponentFile) return -1;
        if (b === primaryComponentFile) return 1;
        if (a.name.substring(0, a.name.lastIndexOf('.')) === primaryComponentFileNameSansExtension) return -1;
        if (b.name.substring(0, b.name.lastIndexOf('.')) === primaryComponentFileNameSansExtension) return 1;
        return a.name < b.name ? -1 : 1;
      })
    }
    return uiSourceFiles;
  });

  readonly $visibleSource = mapSignal(this.$selectedTab, this.$sources,
    (tabType, sources) => sources.length && tabType !== 'demo' ? sources.find(x => x.type === tabType) : undefined);

  private readonly $primaryComponentFinder = computed(() => {
    const primaryComponentPattern = this.$primaryComponentPattern();
    if (primaryComponentPattern) {
      const matcherRegex = new RegExp(primaryComponentPattern);
      return (x: SourceFile) => matcherRegex.test(x.name);
    };
    return (x: SourceFile) => x.type === 'typescript';
  })
  private readonly typeLabels: Record<string, string> = {
    'html': 'HTML',
    'typescript': 'TypeScript'
  };

  openProject(): void {

    this.demoSvc.openProject(this.$name(), this.$sources(), this.$primaryComponentFinder());
  }
}

