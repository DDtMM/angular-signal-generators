import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="gatedEffect">
  <div>
    An effect that starts, stops or runs based on conditions passed to options.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
// This will run only once, after $userInfo is set.
const $userInfo = signal&lt;UserInfo | undefined&gt;(undefined);
gatedEffect(() => doSomethingWithRequiredUserInfo($userInfo()!), 
  {{'{'}} start: () => $userInfo() !== undefined, times: 1 {{'}'}});
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatedEffectHomeDemoComponent {}
