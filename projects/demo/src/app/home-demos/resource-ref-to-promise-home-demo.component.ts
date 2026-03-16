import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="resourceRefToPromise">
  <div>
    Converts an Angular resource reference into a promise that resolves on completion.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
const userResource = getUserResource();
const user = await resourceRefToPromise(userResource, injector);
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceRefToPromiseHomeDemoComponent {}
