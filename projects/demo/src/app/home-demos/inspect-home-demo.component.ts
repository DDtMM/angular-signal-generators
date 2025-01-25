import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="inspect">
  <div>
    Outputs any changes to deeply nested signals.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
$age = signal(21);
$name = signal('Danny');
inspect({{'{'}} age: $age, name: $name {{'}'}}); // [LOG]: {{'{'}} age: 21, name: 'Danny' {{'}'}}
$age.set(102); // [LOG]: {{'{'}} age: 102, name: 'Danny' {{'}'}}
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectHomeDemoComponent {}
