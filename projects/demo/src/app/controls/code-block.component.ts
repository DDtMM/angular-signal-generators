import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { CopyButtonComponent } from './copy-button.component';

/** Renders a demo with sources.  The demo component should be passed as content. */
@Component({
  selector: 'app-code-block',
  host: { class: 'block relative bg-slate-50 dark:bg-slate-800 whitespace-pre-wrap w-full overflow-auto' },
  imports: [CopyButtonComponent, HighlightModule],
  template: `

  <div class="sticky top-0 left-0">
    <div class="absolute p-1 right-0 ">
      <app-copy-button [content]="$content()" [description]="'Copy content from ' + $name()" />
    </div>
  </div>
  <code class="h-full w-full whitespace-pre  bg-slate-50 dark:bg-slate-800  " [highlight]="$content()" [language]="$language()"></code>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockComponent {
  readonly $content = input.required<string>({ alias: 'content' });
  readonly $language = input<string>('unknown', { alias: 'language' });

  readonly $name = input<string>('file', { alias: 'name' });
}
