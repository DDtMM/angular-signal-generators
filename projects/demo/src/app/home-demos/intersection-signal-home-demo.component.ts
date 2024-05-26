import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { intersectionSignal } from 'projects/signal-generators/src/public-api';
import { IntersectionSignalDemoComponent } from '../demos/intersection-signal/intersection-signal-demo/intersection-signal-demo.component';

@Component({
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent, IntersectionSignalDemoComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="intersectionSignal">
  <div>
  Wraps IntersectionObserver so that changes in the intersection of an element with its ancestor can be observed.
  </div>
  <div class="divider">Example</div>
  <app-intersection-signal-demo />
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntersectionSignalHomeDemoComponent {
  readonly $root = viewChild<ElementRef>('rootEl');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $intersection = intersectionSignal(this.$target, { root: this.$root() });
}
