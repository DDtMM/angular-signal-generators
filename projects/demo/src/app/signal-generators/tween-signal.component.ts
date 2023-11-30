import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { EASING_NAMES, EasingName, InterpolateStepFn, tweenSignal } from 'projects/signal-generators/src/public-api';
import { sequenceSignal } from 'projects/signal-generators/src/public-api';
import { SignalHeaderComponent } from '../controls/signal-header.component';


@Component({
  selector: 'app-tween-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightModule, SignalHeaderComponent],
  template: `
<!-- for some reason the API docs come out with -1 at the end -->
<app-signal-header name="Tween Signal" apiPath="./api/functions/tweenSignal-1.html" [types]="['generator', 'signal']" />
<p>
  A very blatant ripoff of Svelte's Tweened function.
  This allows you to create engaging simple transition animations with just a signal.
  By default this can automatically tween between a number, array of numbers, or Record of numbers.
  You can also pass an interpolation function to tween between objects of any type!
</p>
<div>
  <h3>Example</h3>
  <pre><code [highlight]="simpleExample" [languages]="['typescript']"></code></pre>
</div>
<div class="flex flex-row gap-3 items-center pt-3">
  <span>Easing Function for demos 1 and 2.</span>
  <select class="select select-primary select-sm" [ngModel]="easingFn()" (ngModelChange)="easingFn.set($event)">
    @for (easing of easingNames; track easing) {
      <option [value]="easing">{{easing}}</option>
    }
  </select>
</div>
<h3>Demo 1: Simple number</h3>
<div class="flex flex-col w-full sm:flex-row items-center">
  <div class="flex-none">
    <div class="join pr-3">
      <button type="button" class="btn btn-primary join-item" (click)="tweenSignalSimple.set(0, { easing: easingFn() })">0%</button>
      <button type="button" class="btn btn-primary join-item" (click)="tweenSignalSimple.set(50, { easing: easingFn() })">50%</button>
      <button type="button" class="btn btn-primary join-item" (click)="tweenSignalSimple.set(100, { easing: easingFn() })">100%</button>
    </div>
  </div>
  <div>
    <input class="range range-primary" type="range" [value]="tweenSignalSimple()" min="0" max="100" />
  </div>
</div>
<h3>Demo 2: Multiple numbers</h3>
<div class="flex flex-col w-full sm:flex-row items-center">
  <div>
    Touch me!
    <div class="cursor-pointer w-36 h-36 bg-green-600 rounded-lg border-slate-900 border-solid border" (click)="tweenSignalCoords.set([$event.offsetX, $event.offsetY], { easing: easingFn() }) ">
      <div class="w-4 h-4 bg-slate-900 rounded-full" [ngStyle]="{ 'translate': tweenSignalCoords()[0] + 'px ' + tweenSignalCoords()[1] + 'px' }">
      </div>
    </div>
  </div>
</div>
<h3>Demo 3: Fun with interpolation!</h3>
<div class="flex flex-col items-center sm:items-start gap-3">
  <div>
    You can tween between anything!
  </div>
  <div class="flex flex-row w-full gap-3 ">
    <div>
      <button type="button" class="btn btn-primary" (click)="stringInterpolationSequence.next()">Type</button>
    </div>
    <div class="chat chat-start grow">
      <div class="chat-bubble" [ariaDescription]="stringInterpolationSequence()">
        <span aria-hidden="true">{{stringInterpolationTween()}}</span>
      </div>
    </div>
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TweenSignalComponent {
  readonly easingNames = EASING_NAMES;
  readonly easingFn = signal<EasingName>('easeInBack');
  readonly tweenSignalSimple = tweenSignal(0);
  readonly tweenSignalCoords = tweenSignal([0, 0]);
  readonly stringInterpolationSequence = sequenceSignal(['Press the button to see lame typing effect.', 'I should put something funny here!', 'Does anybody know what a typewriter is?']);
  readonly stringInterpolationTween = tweenSignal(this.stringInterpolationSequence, { duration: 2000, interpolator: stringInterpolationFactory });
  readonly simpleExample = `readonly someNumber = tweenSignal(0, { easing: 'easeOutSine' });
setSomeNumber(): void {
  this.someNumber.set(100);
}
`
}

function stringInterpolationFactory(a: string, b: string): InterpolateStepFn<string> {
  const midPoint = a.length / Math.max(1, (a.length + b.length)) * .25;

  return (progress: number): string => {
    switch (progress) {
      case 0: return a;
      case 1: return b;
      default:
        const aProgress = midPoint !== 0 ? Math.min(1, progress / midPoint) : 1;
        const bProgress = midPoint !== 1 ? Math.max(0, (progress - midPoint) / (1 - midPoint)) : 1;
        return a.slice(0, Math.floor((1 - aProgress) * a.length)) + b.slice(0, Math.floor(bProgress * b.length));
    }
  }
}
