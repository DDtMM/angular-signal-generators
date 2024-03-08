import { ChangeDetectionStrategy, Component, ElementRef, computed, input } from '@angular/core';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/** Can copy element or text to clipboard by clicking the button. */
@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [ClipboardModule, FontAwesomeModule],
  template: `
    <button type="button" class="btn btn-ghost p-2 leading-none min-h-0 h-auto" [cdkCopyToClipboard]="$value()"
      [attr.aria-label]="$description()">
      <fa-icon [icon]="faCopy" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyButtonComponent {
  /** Raw string content to copy from. */
  readonly $content = input<string | null | undefined>(undefined, { alias: 'content' });
  readonly $description = input<string>('Copy nearby text', { alias: 'description '});
  /** An element to copy inner text from.  Takes precedence over $content */
  readonly $element = input<HTMLElement | ElementRef | null | undefined>(undefined, { alias: 'element' });
  readonly faCopy = faCopy;
  /** The value that will be copied. */
  readonly $value = computed(() => {
    const element = this.$element();
    if (element) {
      return 'nativeElement' in element ? (element.nativeElement as HTMLElement).innerText : element.innerText;
    }
    return this.$content() ?? '';
  });
}
