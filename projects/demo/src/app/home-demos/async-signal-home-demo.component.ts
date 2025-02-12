import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="asyncSignal">
  <div>
  "Flattens" a source of promises or observables to a signal of result values, switching to the new source as soon as it changes.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
$id = signal(0);
// call getCustomer every time $id changes.
$customer = asyncSignal(() => this.$id() !== 0 ? this.getCustomer(this.$id()) : undefined);
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncSignalHomeDemoComponent {

}
