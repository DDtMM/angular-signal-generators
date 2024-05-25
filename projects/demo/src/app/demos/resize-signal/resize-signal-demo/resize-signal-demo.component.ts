import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mapSignal, resizeSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-resize-signal-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './resize-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeSignalDemoComponent {
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $width = model<number>(50);
  readonly $resize = resizeSignal(this.$target);
  readonly $resizeResult = mapSignal(this.$resize, (changes) => {
    const change = changes[0];
    return !change
      ? 'No Changes'
      : `Width - ${change.contentRect.width.toFixed(0)}.  Height - ${change.contentRect.height}.`
  });
}
