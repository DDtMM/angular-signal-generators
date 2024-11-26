import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SpringOptions, springSignal } from '@ddtmm/angular-signal-generators';
import { SpringOptionsComponent } from "../shared/spring-options.component";

@Component({
    selector: 'app-simple-spring-demo',
    templateUrl: './simple-spring-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SpringOptionsComponent]
})
export class SimpleSpringDemoComponent {
  readonly $springOptions = signal<Partial<SpringOptions>>({ damping: 3, stiffness: 100 });
  readonly $sliderValue = springSignal(0, { clamp: true, ...this.$springOptions() });
}
