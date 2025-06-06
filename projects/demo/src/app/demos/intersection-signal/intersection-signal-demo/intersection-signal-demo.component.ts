import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { intersectionSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-intersection-signal-demo',
    imports: [CommonModule],
    templateUrl: './intersection-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntersectionSignalDemoComponent {
  readonly $root = viewChild<ElementRef>('rootEl');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $intersection = intersectionSignal(this.$target, { root: this.$root() });
}
