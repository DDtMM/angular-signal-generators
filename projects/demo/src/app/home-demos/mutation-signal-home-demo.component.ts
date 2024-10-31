import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';
import { MutationSignalDemoComponent } from '../demos/mutation-signal/mutation-signal-demo/mutation-signal-demo.component';

@Component({
    imports: [HomeBoxComponent, MutationSignalDemoComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="mutationSignal">
  <div>
  Wraps MutationObserver so changes made to the properties of an element can be observed.
  </div>
  <div class="divider">Example</div>
  <app-mutation-signal-demo></app-mutation-signal-demo>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutationSignalHomeDemoComponent {}
