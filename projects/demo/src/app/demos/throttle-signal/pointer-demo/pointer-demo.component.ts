import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { throttleSignal } from '@ddtmm/angular-signal-generators';

interface Point { x: number; y: number; }

@Component({
  selector: 'app-throttle-pointer-demo',
  imports: [FormsModule],
  templateUrl: './pointer-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointerDemoComponent {
  readonly $pointer = signal<Point>({ x: 0, y: 0 });
  readonly $throttleTime = signal(500);
  readonly $throttled = throttleSignal(this.$pointer, this.$throttleTime);

  move(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    const bounds = target.getBoundingClientRect();
    this.$pointer.set({ x: Math.round(event.clientX - bounds.left), y: Math.round(event.clientY - bounds.top) });
  }
}
