import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, viewChild } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';

/**
 * ngx-highlight-jxs only accepts code from a variable.  This be inline.  Though honestly it's a pain in the butt.
 * For one thing, the code has to be in a pre element.
 *
 * This works in a strange way where it takes the inner text projected into it and copies it to the highlight directive.
 */
@Component({
    selector: 'app-example-code',
    imports: [CommonModule, HighlightModule],
    preserveWhitespaces: true,
    template: `
<pre class="h-full w-full">@if ($text(); as text) {<code class="h-full w-full" [highlight]="text" language="typescript"></code>}</pre>
<div #contentWrapper class="hidden"><ng-content /></div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleCodeComponent {
  /** Wraps transcluded content. */
  readonly content = viewChild<ElementRef<HTMLElement>>('contentWrapper');
  /** Code text from contentWrapper. */
  readonly $text = computed(() => this.content()?.nativeElement?.innerText.trim() ?? '');
}
