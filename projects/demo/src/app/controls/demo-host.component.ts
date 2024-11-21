import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { mapSignal } from '@ddtmm/angular-signal-generators';
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
    imports: [CopyButtonComponent, CommonModule, FontAwesomeModule, HighlightModule],
    template: `
  <div class="flex flex-row gap-3">
    <div class="mb-1 text-xl text-secondary">{{$name()}}</div>
    <button type="button" class="btn btn-secondary btn-outline btn-sm" (click)="openProject()" title="Open in StackBlitz">
      <img class="w-4" alt="Open in StackBlitz" src="assets/stackblitz-icon.svg"/>
      <span class="hidden sm:inline">StackBlitz</span>
    </button>
  </div>
  <div class="grid grid-flow-row pt-3">
    <div role="tablist" class="tabs tabs-boxed z-10 justify-self-start mb-1">
      <button role="tab" class="tab"
          [ngClass]="{ 'tab-active': $selectedTab() === demoTabId }"
          (click)="$selectedTab.set(demoTabId)">
          Demo
      </button>
      @for (source of $visibleSources(); track source.name) {
        <button role="tab" class="tab text-nowrap"
          [ngClass]="{ 'tab-active': $selectedTab() === source.id}"
          (click)="$selectedTab.set(source.id)">
          {{source.label}}
        </button>
      }
    </div>
    @if ($selectedTab() === demoTabId) {
      <div role="tab" class="border border-base-300 bg-slate-50 dark:bg-slate-800  w-full p-3 shadow-lg">
        <ng-content />
      </div>
    }
    @if($selectedSource(); as src) {
 
      <div role="tab" class="relative border border-base-300 bg-slate-50 dark:bg-slate-800  whitespace-pre-wrap w-full max-w-full max-h-[400px] overflow-auto shadow-lg ">
        <div class="sticky top-0 left-0">
          <div class="absolute p-1 right-0 ">
            <app-copy-button [content]="src.code" [description]="'Copy content from ' + src.name" />
          </div>
        </div>

        <code class="h-full w-full whitespace-pre  bg-slate-50 dark:bg-slate-800  " [highlight]="src.code" [language]="src.type"></code>
      </div>
    }
  </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoHostComponent {
  private readonly demoSvc = inject(DemoService);

  readonly demoTabId = '_demo_';
  /** A regex pattern to hide sources from the demo that should be included the full project. */
  readonly $hiddenPattern = input<string | undefined>(undefined, { alias: 'hiddenPattern' });
  /** Displayed name of demo. */
  readonly $name = input.required<string>({ alias: 'name' });
  /** A string that will be used to construct a regex to match the source names */
  readonly $pattern = input.required<string>({ alias: 'pattern' });
  /** Optional input to detect primary component.  If not passed then the first typescript file is used. */
  readonly $primaryComponentPattern = input<string | undefined>(undefined, { alias: 'primaryComponentPattern' });
  /** Currently visible tab */
  readonly $selectedTab = signal<string | number>(this.demoTabId);
  /** All source files relevant to the demo. */
  readonly $sources = computed<SourceFile[]>(() => {
    const sourceFilesMatcher = new RegExp(this.$pattern());
    return this.demoSvc.getSourceFiles(sourceFilesMatcher);
  });

  readonly $visibleSources = computed<DemoHostSourceFile[]>(() => {
    const visibleFilesFinder = this.$visibleFilesFinder();
    const primaryComponentFinder = this.$primaryComponentFinder();
    const sourceFiles = this.$sources().filter(visibleFilesFinder);
    const uiSourceFiles = sourceFiles
      .map((x, i) => ({
        ...x,
        /** It is shorter to use the file type, but if sources are too many then the file names are used. */
        label: sourceFiles.length <= 2 ? this.typeLabels[x.type] || x.name : x.name,
        id: i
      }));
    const primaryComponentFile = uiSourceFiles.find(primaryComponentFinder)?.name || '_NO_MATCH_.zzz';
    const primaryComponentFileNameSansExtension = primaryComponentFile.substring(0, primaryComponentFile.lastIndexOf('.'));
    uiSourceFiles.sort((a, b) => {
      if (a.name === primaryComponentFile) return -1;
      if (b.name === primaryComponentFile) return 1;
      const aNameBeforeExt = a.name.substring(0, a.name.lastIndexOf('.'));
      const bNameBeforeExt = b.name.substring(0, b.name.lastIndexOf('.'));
      if (aNameBeforeExt === bNameBeforeExt) {
        // have typescript files go first if names are equal.
        if (a.type === 'typescript') {
          return -1;
        }
        if (b.type === 'typescript') {
          return 1;
        }
      }
      // if a or b are named similarly to the primary component then keep them together by moving them to the top.
      if (a.name.substring(0, a.name.lastIndexOf('.')) === primaryComponentFileNameSansExtension) return -1;
      if (b.name.substring(0, b.name.lastIndexOf('.')) === primaryComponentFileNameSansExtension) return 1;
      return a.name < b.name ? -1 : 1;
    });

    return uiSourceFiles;
  });

  readonly $selectedSource = mapSignal(this.$selectedTab, this.$visibleSources, (tab, sources) => sources.find(x => x.id === tab));

  /** Converts the hidden files pattern to a function that returns true for visible files. */
  private readonly $visibleFilesFinder = computed(() => {
    const hiddenPattern = this.$hiddenPattern();
    if (hiddenPattern) {
      const matcherRegex = new RegExp(hiddenPattern);
      return (x: SourceFile) => !matcherRegex.test(x.name);
    }
    return () => true;
  });
  private readonly $primaryComponentFinder = computed(() => {
    const primaryComponentPattern = this.$primaryComponentPattern();
    if (primaryComponentPattern) {
      const matcherRegex = new RegExp(primaryComponentPattern);
      return (x: SourceFile) => matcherRegex.test(x.name);
    }
    return (x: SourceFile) => x.type === 'typescript';
  });

  private readonly typeLabels: Record<string, string> = {
    'html': 'HTML',
    'typescript': 'TypeScript'
  };

  openProject(): void {
    this.demoSvc.openProject(this.$name(), this.$sources(), this.$primaryComponentFinder());
  }
}

