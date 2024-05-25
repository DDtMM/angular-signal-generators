import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { FormsModule } from '@angular/forms';
import { mapSignal, resizeSignal } from 'projects/signal-generators/src/public-api';

@Component({
  standalone: true,
  imports: [FormsModule, ExampleCodeComponent, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="resizeSignal">
  <div>
  Wraps ResizeObserver so changes made to the dimensions of an element can be observed.
  </div>
  <div class="divider">Example</div>

  <div class="flex flex-col gap-3">
    <div class="flex flex-row gap-3">
      <label for="widthRange">Element Width</label>
      <input id="widthRange" type="range" min="0" max="100" class="range range-primary" [(ngModel)]="$width">
    </div>
    <div class="flex flex-row justify-center w-full">
      <div #targetEl class="rounded bg-secondary h-8" [style.width.%]="$width()" title="Adjustable Width Element"></div>
    </div>
    <div>
      Last Change: {{$resizeResult()}}
    </div>
  </div>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeSignalHomeDemoComponent {
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
