import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { intersectionSignal } from 'projects/signal-generators/src/public-api';

@Component({
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="intersectionSignal">
  <div>
  Wraps IntersectionObserver so that changes in the intersection of an element with its ancestor can be observed.
  </div>
  <div class="divider">Example</div>
  <div class="overflow-x-auto w-full h-16 bg-slate-500 relative" #rootEl>
    <div class="w-[300%]">
      <div class="w-8 h-8 mt-2 absolute bg-primary rounded left-[150%]" #targetEl></div>
    </div>
  </div>
  <div>
    {{$intersection().length > 0 && $intersection()[0].isIntersecting ? 'Is Intersecting' : 'Is Not Intersecting'}}
  </div>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntersectionSignalHomeDemoComponent {
  readonly $root = viewChild<ElementRef>('rootEl');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $intersection = intersectionSignal(this.$target, { root: this.$root() });
}
