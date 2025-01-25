import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from "../../controls/code-block.component";
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';


@Component({
    selector: 'app-gated-effect-page',
    imports: [MemberPageHeaderComponent, CodeBlockComponent],
    template: `
<app-member-page-header fnName="gatedEffect"/>
<div class="flex flex-col gap-3">
  <div>
    An effect that will start, stop, or conditionally run based on conditions set in the passed options. 
    Some use cases for this effect include:
    <ul class="list-disc list-inside">
      <li>Running initialization logic only one time.</li>
      <li>Validating values only after all required signals are set.</li>
      <li>Stopping effects that are no longer needed.</li>
    </ul>
  </div>
  <div>
    In addition to standard effect options, the following options are available:
      <ul class="list-disc list-inside">
      <li>if: A function that must be true for the effect to run.</li>
      <li>start: A function that must return true for the effect to start running.  Once it is true once, it will not be checked again.</li>
      <li>times: The number of times the effect should run.</li>
      <li>until: A function that stop that effect as soon as it returns true.</li>
    </ul>
  </div>
  <div>
    <h3 class="mb-1 text-xl text-secondary">Example: Initialization Side Effect</h3>
    <p>This will only execute once after $userInfo has a value, and then the effect will be properly destroyed.</p>
    <app-code-block language="typescript" ngPreserveWhitespaces>
const $userInfo = signal&lt;UserInfo | undefined&gt;(undefined);
gatedEffect(() => doSomethingWithRequiredUserInfo($userInfo()!), 
  {{'{'}} start: () => $userInfo() !== undefined, times: 1 {{'}'}});
    </app-code-block>
  </div>
  <div>
    <h3 class="mb-1 text-xl text-secondary">Example: Logging an Invalid State</h3>
    <p>This will log errors only after values have been set.</p>
    <app-code-block language="typescript" ngPreserveWhitespaces>
const $userName = signal&lt;string | undefined&gt;(undefined);
const $address = signal&lt;string | undefined&gt;(undefined);
gatedEffect(() => logMissingRequiredData()), 
  {{'{'}} start: () => !!$userInfo() || !!$address() , if: () => !$userInfo() || !$address() {{'}'}});
    </app-code-block>
  </div>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatedEffectPageComponent { }
