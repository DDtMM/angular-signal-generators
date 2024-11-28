import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SpringOptions, springSignal } from '@ddtmm/angular-signal-generators';
import { SpringOptionsComponent } from "../shared/spring-options.component";

@Component({
    selector: 'app-multiple-spring-numbers-demo',
    templateUrl: './multiple-spring-numbers-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SpringOptionsComponent]
})
export class MultipleSpringNumbersDemoComponent {
  readonly $springOptions = signal<Partial<SpringOptions>>({ damping: 7, stiffness: 150 });
  readonly $coords = springSignal([0, 0], { ...this.$springOptions() });

  setCords(event: MouseEvent, desiredTarget: HTMLElement) {
    if (event.target === desiredTarget) {
      this.$coords.set([event.offsetX - 8, event.offsetY - 8]);
    }
  }
}
