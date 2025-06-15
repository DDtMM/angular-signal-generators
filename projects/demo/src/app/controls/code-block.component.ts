import { ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { CopyButtonComponent } from './copy-button.component';

/** Renders a demo with sources.  The demo component should be passed as content. */
@Component({
  selector: 'app-code-block',
  host: { class: 'block relative  whitespace-pre-wrap w-full overflow-auto' },
  imports: [CopyButtonComponent, HighlightModule],
  template: `
  @if($showCopy()) {
    <div class="sticky top-0 left-0">
      <div class="absolute p-1 right-0 ">
        <app-copy-button [content]="$content()" [description]="'Copy content from ' + $name()" />
      </div>
    </div>
  }
  <code class="h-full min-w-full w-fit whitespace-pre bg-slate-50 dark:bg-slate-800 " [highlight]="$content()" [language]="$language()"></code>
  <!-- this is here only to copy from transcluded content -->
  <div #contentWrapper class="hidden" aria-hidden="true"><ng-content /></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockComponent {
  /** Code content either from an input attribute or an inner element */
  readonly $content = computed(() => this.$contentInput() ?? this.$contentTranscluded()?.nativeElement?.textContent?.trim() ?? '');
  /** Code to display that is passed via an input attribute.  Code can also be included as an inner element. */
  readonly $contentInput = input<string | undefined>(undefined, { alias: 'content' });
  /** Content that is passed in as a child element. */
  readonly $contentTranscluded = viewChild<ElementRef<HTMLElement>>('contentWrapper');
  /** Language to display.  Default to text. */
  readonly $language = input<string>('text', { alias: 'language' });
  /** Used in the copy button description of what is being copied. */
  readonly $name = input<string>('example', { alias: 'name' });
  /** Whether to show the copy button.  By default this is true. */
  readonly $showCopy = input<boolean>(true, { alias: 'showCopy' });

}
