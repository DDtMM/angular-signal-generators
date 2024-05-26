import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';

/**
 * ngx-highlight-jxs only accepts code from a variable.  This be inline.  Though honestly it's a pain in the butt.
 * For one thing, the code has to be in a pre element.
 *
 * This works in a strange way where it takes the inner text projected into it and copies it to the highlight directive.
 */
@Component({
  selector: 'app-example-code',
  standalone: true,
  imports: [CommonModule, HighlightModule],
  preserveWhitespaces: true,
  template: `
<pre class="h-full w-full">@if (text) {<code class="h-full w-full" [highlight]="text" language="typescript"></code>}</pre>
<div #contentWrapper class="hidden">
  <ng-content></ng-content>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleCodeComponent implements AfterViewInit {
  @ViewChild('contentWrapper') content?: ElementRef

  /** Code text from contentWrapper. */
  text?: string;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.text = this.content?.nativeElement?.innerText.trim();
    this.cd.detectChanges();
  }
}
