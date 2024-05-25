import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { intersectionSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-intersection-signal-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intersection-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntersectionSignalDemoComponent {
  readonly $root = viewChild<ElementRef>('rootEl');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $intersection = intersectionSignal(this.$target, { root: this.$root() });
}
