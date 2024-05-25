import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { mutationSignal } from 'projects/signal-generators/src/public-api';
import { mapSignal } from 'signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="mutationSignal">
  <div>
  Wraps MutationObserver so changes made to the properties of an element can be observed.
  </div>
  <div class="divider">Example</div>
  <div class="flex flex-row gap-3">
    <div class="join">
      <button type="button" class="btn btn-primary join-item" (click)="$color.set('red')">Red</button>
      <button type="button" class="btn btn-primary join-item" (click)="$color.set('green')">Green</button>
      <button type="button" class="btn btn-primary join-item" (click)="$color.set('blue')">Blue</button>
    </div>
    <div class="text-center border border-solid rounded grow">
      <div #targetEl class="p-3" [style]="{ color: $color() }">Change Me</div>
    </div>
  </div>
  <div>
    Last Change: {{$mutationResult()}}
  </div>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutationSignalHomeDemoComponent {
  readonly $color = signal<string>('');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $mutation = mutationSignal(this.$target);
  readonly $mutationResult = mapSignal(this.$mutation, (changes) => {
    const change = changes[0];
    return !change
      ? 'No Changes'
      : `Changed ${change.attributeName}.  Color is ${(change.target as HTMLElement).getAttribute(change.attributeName!)}.`
  });
}
