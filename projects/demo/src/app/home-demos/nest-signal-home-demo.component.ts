import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../controls/code-block.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
    imports: [CodeBlockComponent, HomeBoxComponent],
    hostDirectives: [ContentsClassDirective],
    template: `
<app-home-box fnName="nestSignal">
  <div>
    Takes a value that contains one or more nested signals and emits their resolved values.
  </div>
  <div class="divider">Example</div>
  <app-code-block language="typescript" ngPreserveWhitespaces [showCopy]="false">
$age = signal(21);
$name = signal('Danny');
$nest = nestSignal({{'{'}} age: $age, name: $name {{'}'}});
console.log($nest()); // [LOG]: {{'{'}} age: 21, name: 'Danny' {{'}'}}
  </app-code-block>
</app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestSignalHomeDemoComponent {}
