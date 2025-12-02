
import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { mutationSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-mutation-signal-demo',
    imports: [],
    templateUrl: './mutation-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutationSignalDemoComponent {
  readonly $color = signal<string>('');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $mutation = mutationSignal(this.$target);
  readonly $mutationResult = computed(() => {
    const change = this.$mutation()[0];
    return !change
      ? 'No Changes'
      : !change.attributeName
      ? 'Changed Unknown Attribute'
      : `Changed ${change.attributeName}.  Color is ${(change.target as HTMLElement).getAttribute(change.attributeName)}.`;
  });
}
