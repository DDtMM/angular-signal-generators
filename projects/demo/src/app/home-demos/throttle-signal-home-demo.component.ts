import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { throttleSignal } from '@ddtmm/angular-signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

interface Point { x: number; y: number; }

@Component({
  imports: [HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="throttleSignal">
    <div>Limits how frequently a signal publishes rapidly changing values.</div>
    <div class="divider">Example</div>
    <div class="h-24 rounded-lg bg-base-200 grid place-items-center cursor-crosshair" (pointermove)="move($event)">
      <div class="text-center text-sm">
        <div>Move the pointer here</div>
        <div>Raw: {{$pointer().x}}, {{$pointer().y}}</div>
        <div class="text-primary font-bold">Throttled: {{$throttled().x}}, {{$throttled().y}}</div>
      </div>
    </div>
    <div class="text-xs text-base-content/70">Throttled once per second</div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThrottleSignalHomeDemoComponent {
  readonly $pointer = signal<Point>({ x: 0, y: 0 });
  readonly $throttled = throttleSignal(this.$pointer, 1000);

  move(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    const bounds = target.getBoundingClientRect();
    this.$pointer.set({ x: Math.round(event.clientX - bounds.left), y: Math.round(event.clientY - bounds.top) });
  }
}
