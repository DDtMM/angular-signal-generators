import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { mutationSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-child-element-demo',
    imports: [],
    templateUrl: './child-element-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildElementDemoComponent {
  readonly $showElement = signal(false);
  readonly $target = viewChild<ElementRef<HTMLElement>>('targetEl');
  readonly $mutation = mutationSignal(this.$target, { childList: true, subtree: true });
  readonly $childElement = computed(() => {
    // Reading the mutation signal reruns the DOM query when children are added or removed.
    return this.$mutation()[0]?.target.firstChild as HTMLElement;
  });
}
