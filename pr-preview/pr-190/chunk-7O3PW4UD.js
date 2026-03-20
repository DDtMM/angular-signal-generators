import{C as I,D as L,E as $,F as d,G as m,H as w,Ha as B,Ja as W,M as q,O as C,Q as k,R as _,S as V,W as h,X as A,Y as z,Ya as G,da as M,db as Q,h as N,i as E,j as R,k as O,ka as v,la as y,p as j,pa as U,t as c,v as P,wa as H,y as S,z as D}from"./chunk-DZHK45N5.js";import{a as f,b as T}from"./chunk-DAQOROHW.js";var F={"tween-signal/simple-tween-demo/simple-tween-demo.component.ts":`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, tweenSignal } from '@ddtmm/angular-signal-generators';
import { easeInBack } from '@ddtmm/angular-signal-generators/easings';
import { EasingSelectorComponent } from '../shared/easing-selector.component';

@Component({
    selector: 'app-simple-tween-demo',
    imports: [EasingSelectorComponent],
    templateUrl: './simple-tween-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleTweenDemoComponent {
  readonly $easingFn = signal<EasingFn>(easeInBack);
  readonly $sliderValue = tweenSignal(0, { easing: this.$easingFn() });
}
`,"tween-signal/simple-tween-demo/simple-tween-demo.component.html":`<div class="flex flex-row gap-3 items-center pb-3">
  <span>Easing Function</span>
  <app-easing-selector [(easingFn)]="$easingFn" (easingFnChange)="$sliderValue.setOptions({ easing: $easingFn() })" />
</div>
<div class="flex flex-col w-full sm:flex-row items-center gap-3">
  <div class="flex-none">
    <div class="join">
      <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(0)">0%</button>
      <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(50)">50%</button>
      <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(100)">100%</button>
    </div>
  </div>
  <div>
    <input class="range range-primary" type="range" [value]="$sliderValue()" min="0" max="100" step=".0001" />
  </div>
</div>
`,"tween-signal/shared/easing-selector.component.ts":`import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EasingFn } from '@ddtmm/angular-signal-generators';
import * as easings from '@ddtmm/angular-signal-generators/easings';

type EasingFnName = keyof typeof easings;

@Component({
    selector: 'app-easing-selector',
    imports: [FormsModule],
    template: \`
  <select class="select select-primary select-sm" [ngModel]="$easingFnName()" (ngModelChange)="setEasingFn($event)">
    @for (easing of easingNames; track easing) {
      <option [value]="easing">{{easing}}</option>
    }
  </select>
  \`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EasingSelectorComponent {
  readonly easingNames = Object.keys(easings) as EasingFnName[];
  readonly $easingFn = model<EasingFn>(easings.easeInBack, { alias: 'easingFn'});
  readonly $easingFnName = computed<EasingFnName>(() => this.getEasingName(this.$easingFn()));

  /** Retrieves the name of the easing function based on the provided easing function or returns "linear". */
  getEasingName(easingFn: EasingFn): EasingFnName {
    return Object.entries(easings).find(([, value]) => value === easingFn)?.[0] as EasingFnName || 'linear';
  }

  /** Sets $easingFn based on the provided easingFnName. */
  setEasingFn(easingFnName: EasingFnName): void {
    this.$easingFn.set(easings[easingFnName]);
  }
}
`,"tween-signal/multiple-numbers-demo/multiple-numbers-demo.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EasingFn, tweenSignal } from '@ddtmm/angular-signal-generators';
import { easeInBack } from '@ddtmm/angular-signal-generators/easings';
import { EasingSelectorComponent } from '../shared/easing-selector.component';

@Component({
    selector: 'app-multiple-numbers-demo',
    imports: [CommonModule, EasingSelectorComponent],
    templateUrl: './multiple-numbers-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleNumbersDemoComponent {
  readonly $easingFn = signal<EasingFn>(easeInBack);
  readonly $coords = tweenSignal([0, 0], { easing: this.$easingFn() });
}
`,"tween-signal/multiple-numbers-demo/multiple-numbers-demo.component.html":`<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->
<!-- eslint-disable @angular-eslint/template/click-events-have-key-events -->
<div class="flex flex-row gap-3 items-center pb-3">
  <span>Easing Function</span>
  <app-easing-selector [(easingFn)]="$easingFn" (easingFnChange)="$coords.setOptions({ easing: $easingFn() })" />
</div>
<div class="cursor-pointer w-36 h-36 bg-green-600 rounded-lg border-slate-900 border-solid border"
  (click)="$coords.set([$event.offsetX - 8, $event.offsetY - 8])" >
  <div class="w-4 h-4 bg-slate-900 rounded-full"
    [ngStyle]="{ 'translate': $coords()[0] + 'px ' + $coords()[1] + 'px' }">
  </div>
</div>
`,"tween-signal/interpolation-demo/interpolation-demo.component.ts":`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InterpolateStepFn, sequenceSignal, tweenSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-interpolation-demo',
    templateUrl: './interpolation-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterpolationDemoComponent {
  readonly $stringInterpolationSequence = sequenceSignal([
    'Press the button to see lame typing effect.',
    'I should put something funny here!',
    'Does anybody know what a typewriter is?'
  ]);
  readonly $stringInterpolationTween = tweenSignal(this.$stringInterpolationSequence, {
    duration: 2000,
    interpolator: stringInterpolationFactory
  });
}

/** Weights the interpolation so the second half takes longer than the first. */
function stringInterpolationFactory(a: string, b: string): InterpolateStepFn<string> {
  const midPoint = (a.length / Math.max(1, a.length + b.length)) * 0.25;

  return (progress: number): string => {
    switch (progress) {
      case 0:
        return a;
      case 1:
        return b;
      default: {
        const aProgress = midPoint !== 0 ? Math.min(1, progress / midPoint) : 1;
        const bProgress = midPoint !== 1 ? Math.max(0, (progress - midPoint) / (1 - midPoint)) : 1;
        return a.slice(0, Math.floor((1 - aProgress) * a.length)) + b.slice(0, Math.floor(bProgress * b.length));
      }
    }
  };
}
`,"tween-signal/interpolation-demo/interpolation-demo.component.html":`<div class="flex flex-col items-center sm:items-start gap-3">
  <div class="flex flex-row w-full gap-3 ">
    <div>
      <button type="button" class="btn btn-primary" (click)="$stringInterpolationSequence.next()">Type</button>
    </div>
    <div class="chat chat-start grow">
      <div class="chat-bubble" [ariaDescription]="$stringInterpolationSequence()">
        <span aria-hidden="true">{{$stringInterpolationTween()}}</span>
      </div>
    </div>
  </div>
</div>
`,"timer-signal/timer-signal-selector-demo/timer-signal-selector-demo.component.ts":`import { Component } from '@angular/core';
import { timerSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-timer-signal-selector-demo',
  templateUrl: './timer-signal-selector-demo.component.html',
  standalone: true,
  imports: [],
})
export class TimerSignalSelectorDemoComponent {
  readonly $timer = timerSignal(1000, 1000, { selector: (tickCount: number) => \`\${tickCount.toString(16)} hex seconds elapsed\` })
}
`,"timer-signal/timer-signal-selector-demo/timer-signal-selector-demo.component.html":`<div class="flex flex-col w-full sm:flex-row gap-3">
  <div class="flex-grow card card-compact shadow-lg bg-base-100">
    <div class="card-body flex flex-col items-center">
      <div>Total Ticks</div>
      <div class="h-7 text-lg">{{$timer()}}</div>
    </div>
  </div>
</div>
`,"timer-signal/timer-signal-demo/timer-signal-demo.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal, timerSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-timer-signal-demo',
    imports: [CommonModule, FormsModule],
    templateUrl: './timer-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerSignalDemoComponent {

  readonly $executions = signal(0);
  readonly $intervalRange = signal(500);
  readonly $mode = sequenceSignal(['interval', 'timeout'] as const);
  readonly $timer = computed(() => this.$mode() === 'timeout' ? this.$timeoutTimer : this.$intervalTimer);
  readonly $timeoutRange = signal(500);
  // timer signal and SSR don't mix.
  readonly $intervalTimer = timerSignal(this.$timeoutRange, this.$intervalRange);
  // timer signal and SSR don't mix.
  readonly $timeoutTimer = timerSignal(this.$timeoutRange);

  constructor() {
    // This is a good example of the danger of using effects to try to maintain a state.
    // There is the possibility that timer ticks will be missed and the count of $executions will be wrong.
    effect(() => {
      const timerValue = this.$timer()();
      if (timerValue !== 0) {
        this.$executions.update(x => ++x);
      }
    });
  }

  toggleMode(): void {
    this.$timer().pause();
    this.$mode.next();
    this.$timer().restart();
  }
}
`,"timer-signal/timer-signal-demo/timer-signal-demo.component.html":`<div class="flex flex-col w-full sm:flex-row gap-3">
  <div>
    <p>Use the controls to below to manipulate the timer.  The right-most button will toggle between interval and timeout modes.</p>
    <div class="flex flex-row gap-2">
      <button type="button" class="btn btn-secondary join-item" (click)="toggleMode()">{{ $mode() }} Mode</button>
      <div class="join gap-0">
        <button type="button" class="btn btn-primary join-item" (click)="$timer().pause()" [disabled]="$timer().state() !== 'running'">Pause</button>
        <button type="button" class="btn btn-primary join-item" (click)="$timer().resume()" [disabled]="$timer().state() !== 'paused'">Resume</button>
        <button type="button" class="btn btn-primary join-item" (click)="$timer().restart()">Restart</button>
      </div>
    </div>
  </div>
  <div class="flex-grow w-full">
    <div>
      <label for="timeoutRange" class="label">Timeout Time: {{$timeoutRange()}}</label>
      <input id="timeoutRange" class="range range-primary" type="range" min="0" max="10000" [(ngModel)]="$timeoutRange" />
    </div>
    <div>
      <label for="intervalRange" class="label" >Interval Time: {{$intervalRange()}}</label>
      <input id="intervalRange" class="range" type="range" min="0" max="10000" [(ngModel)]="$intervalRange"
        [ngClass]="$mode() === 'interval' ? 'range-primary' : 'range-accent'"
        [disabled]="$mode() === 'timeout'" />
    </div>
  </div>
</div>
<div class="flex flex-col w-full sm:flex-row gap-3 pt-3">
  <div class="flex-grow card card-compact shadow-lg bg-base-100">
    <div class="card-body flex flex-col items-center">
      <div>Ticks since Restart</div>
      <div class="h-7 text-lg">{{$timer()()}}</div>
    </div>
  </div>
  <div class="flex-grow card card-compact shadow-lg bg-base-100">
    <div class="card-body flex flex-col items-center">
      <div>Total Ticks</div>
      <div class="h-7 text-lg">{{$executions()}}</div>
    </div>
  </div>
</div>
`,"storage-signal/custom-storage-demo/custom-storage-demo.component.ts":`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { StorageSignalStore, storageSignal } from '@ddtmm/angular-signal-generators';
import { Subject, scan } from 'rxjs';

@Component({
    selector: 'app-custom-storage-demo',
    imports: [FormsModule],
    templateUrl: './custom-storage-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomStorageDemoComponent {
  private readonly storageProvider = new StorageSpy();
  readonly $eventLog = toSignal(this.storageProvider.events$.pipe(scan((acc, cur) => [...acc, cur], [] as string[])));
  readonly $stored = storageSignal('Change Me', 'demos-custom-storage-greeting', this.storageProvider);
}

class StorageSpy implements StorageSignalStore<string> {
  readonly events$ = new Subject<string>();
  readonly storage: Storage | undefined = globalThis.sessionStorage;
  get(key: string): string | undefined {
    this.events$.next(\`Retrieved \${key}.\`);
    return this.storage?.getItem(key) ?? undefined;
  }
  set(key: string, value: string): void {
    this.events$.next(\`Stored \${key} with the value "\${value}".\`);
    this.storage?.setItem(key, value);
  }
}
`,"storage-signal/custom-storage-demo/custom-storage-demo.component.html":`<div class="grid grid-cols-[auto,1fr] gap-3 items-start">
  <label class="label text-nowrap" for="inputVal">Input Value</label>
  <input type="text" class="input input-bordered " id="inputVal" [(ngModel)]="$stored" />
  <div class="label">Events</div>
  <ul class="p-3 rounded-lg text-base-content bg-base-300">
    @for (l of $eventLog(); track $index) {
      <li>{{l}}</li>
    }
  </ul>
</div>
`,"storage-signal/built-in-storage-demo/built-in-storage-demo.component.ts":`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sessionStorageSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-built-in-storage-demo',
    imports: [FormsModule],
    templateUrl: './built-in-storage-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuiltInStorageDemoComponent {
  readonly $stored = sessionStorageSignal('Change Me', 'demos-built-in-storage-greeting');
}
`,"storage-signal/built-in-storage-demo/built-in-storage-demo.component.html":`<div class="flex flex-row gap-3 ">
  <label class="label" for="inputVal">Input Value</label>
  <input type="text" class="input input-bordered flex-grow" id="inputVal" [(ngModel)]="$stored" />
</div>
`,"spring-signal/simple-spring-demo/simple-spring-demo.component.ts":`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SpringOptions, springSignal } from '@ddtmm/angular-signal-generators';
import { SpringOptionsComponent } from "../shared/spring-options.component";

@Component({
    selector: 'app-simple-spring-demo',
    templateUrl: './simple-spring-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SpringOptionsComponent]
})
export class SimpleSpringDemoComponent {
  readonly $springOptions = signal<Partial<SpringOptions>>({ damping: 3, stiffness: 100 });
  readonly $sliderValue = springSignal(0, { clamp: true, ...this.$springOptions() });
}
`,"spring-signal/simple-spring-demo/simple-spring-demo.component.html":`<div class="flex flex-row gap-3 items-center pb-3">
  <app-spring-options [(springOptions)]="$springOptions" (springOptionsChange)="$sliderValue.setOptions($springOptions())" />
</div>
<div class="flex flex-col w-full sm:flex-row items-center gap-3">
  <div class="flex-none">
    <div class="join">
      <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(0)">0%</button>
      <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(50)">50%</button>
      <button type="button" class="btn btn-primary join-item" (click)="$sliderValue.set(100)">100%</button>
    </div>
  </div>
  <div>
    <input class="range range-primary" type="range" [value]="$sliderValue()" min="0" max="100" step=".0001" />
  </div>
</div>
`,"spring-signal/shared/spring-options.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpringOptions } from '@ddtmm/angular-signal-generators';


@Component({
  selector: 'app-spring-options',
  imports: [CommonModule, FormsModule],
  template: \`
<div class="grid grid-cols-[auto,auto,auto] md:grid-cols-[auto,auto,auto,auto,auto,auto] gap-3">
  <div class="grid grid-cols-subgrid gap-3 col-span-3 bg-base-200 p-3 rounded">
    <label for="dampingRange">Damping</label>
    <input id="dampingRange" type="range" min="0.1" max="20" class="range range-primary" step="0.01" 
      [ngModel]="$springOptions().damping" (ngModelChange)="patchOptions({ damping: $event })" />
    <span aria-label="Damping %"> {{ ($springOptions().damping || 0) | number: '1.1-1' }} </span>
  </div>
  <div class="grid grid-cols-subgrid gap-3 col-span-3 bg-base-200 p-3 rounded">
    <label for="stiffnessRange">Stiffness</label>
    <input id="stiffnessRange" type="range" min="0.1" max="200" class="range range-primary" step="0.01"
      [ngModel]="$springOptions().stiffness" (ngModelChange)="patchOptions({ stiffness: $event })" /> 
    <span aria-label="Stiffness %"> {{ ($springOptions().stiffness || 0) | number: '1.1-1' }} </span>
  </div>
</div>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpringOptionsComponent {
  readonly $springOptions = model.required<Partial<SpringOptions>>(
    { alias: 'springOptions' }
  );

  patchOptions(partialOptions: Partial<SpringOptions>): void {
    this.$springOptions.update((x) => ({ ...x, ...partialOptions }));
  }
}
`,"spring-signal/multiple-spring-numbers-demo/multiple-spring-numbers-demo.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SpringOptions, springSignal } from '@ddtmm/angular-signal-generators';
import { SpringOptionsComponent } from "../shared/spring-options.component";

@Component({
    selector: 'app-multiple-spring-numbers-demo',
    templateUrl: './multiple-spring-numbers-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SpringOptionsComponent]
})
export class MultipleSpringNumbersDemoComponent {
  readonly $springOptions = signal<Partial<SpringOptions>>({ damping: 7, stiffness: 150 });
  readonly $coords = springSignal([0, 0], { ...this.$springOptions() });

  setCords(event: MouseEvent, desiredTarget: HTMLElement) {
    if (event.target === desiredTarget) {
      this.$coords.set([event.offsetX - 8, event.offsetY - 8]);
    }
  }
}
`,"spring-signal/multiple-spring-numbers-demo/multiple-spring-numbers-demo.component.html":`<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->
<!-- eslint-disable @angular-eslint/template/click-events-have-key-events -->
<div class="flex flex-col gap-3">
  <div class="flex flex-row gap-3 items-center">
    <app-spring-options [(springOptions)]="$springOptions" (springOptionsChange)="$coords.setOptions($springOptions())" />
  </div>
  <div #target class="relative cursor-pointer w-36 h-36 bg-green-600 rounded-lg border-slate-900 border-solid border overflow-hidden"
    (click)="setCords($event, target)">
    <div class="w-4 h-4 bg-slate-900 rounded-full"
      [ngStyle]="{ 'translate': $coords()[0] + 'px ' + $coords()[1] + 'px' }">
    </div>
    <div class="text-sm absolute bottom-2 right-2 pointer-events-none">
      ({{$coords()[0] | number: '1.1-2'}}, {{$coords()[1] | number: '1.1-2'}})
    </div>
  </div>
  </div>
`,"sequence-signal/toggle-demo/toggle-demo.component.ts":`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-toggle-demo',
    imports: [FormsModule],
    templateUrl: './toggle-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleDemoComponent {
  readonly $trueFalseToggle = sequenceSignal([false, true]);
}
`,"sequence-signal/toggle-demo/toggle-demo.component.html":`<div class="flex flex-row gap-3 items-center">
  <input type="checkbox" class="toggle" [(ngModel)]="$trueFalseToggle" aria-label="Bound toggle button" />
  <div class="label">Current Value:</div>
  <div>{{$trueFalseToggle()}}</div>
</div>
`,"sequence-signal/fibonacci-demo/fibonacci-demo.component.ts":`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-fibonacci-demo',
    imports: [FormsModule],
    templateUrl: './fibonacci-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FibonacciDemoComponent {
  readonly $fibonacci = sequenceSignal({
    [Symbol.iterator]() {
      let current = 0;
      let next = 1;
  
      return {
        next() {
          const value = current;
          [current, next] = [next, current + next];
          return { value, done: false };
        }
      };
    }
  });
  readonly $fibonacciStepSize = signal(1);
}
`,"sequence-signal/fibonacci-demo/fibonacci-demo.component.html":`<div class="flex flex-row items-center">
  <div class="flex flex-col text-center px-3">
    <div class="label">Value</div>
    <div class="text-lg">{{$fibonacci()}}</div>
  </div>
  <div class="px-3">
    <label for="fibonacciStepSize" class="label">Step Size: {{$fibonacciStepSize()}}</label>
    <input id="fibonacciStepSize" class="range" type="range" min="0" max="10" [(ngModel)]="$fibonacciStepSize" />
  </div>
  <div class="join">
    <button type="button" class="btn btn-primary join-item" (click)="$fibonacci.next($fibonacciStepSize())">Next</button>
    <button type="button" class="btn btn-primary join-item" (click)="$fibonacci.reset()">Reset</button>
  </div>
</div>
`,"sequence-signal/choices-demo/choices-demo.component.ts":`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-choices-demo',
    imports: [FormsModule],
    templateUrl: './choices-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChoicesDemoComponent {
  readonly $sequenceChoices = sequenceSignal(['a', 'b', 'c']);
}
`,"sequence-signal/choices-demo/choices-demo.component.html":`<div class="flex flex-row gap-3">
  <div class="flex flex-col gap-1">
    <div class="flex flex-row items-center gap-3">
      <input type="radio" class="radio checked:bg-blue-500" value="a" [(ngModel)]="$sequenceChoices" /> Choice A
    </div>
    <div class="flex flex-row items-center gap-3">
      <input type="radio" class="radio checked:bg-blue-500" value="b" [(ngModel)]="$sequenceChoices" /> Choice B
    </div>
    <div class="flex flex-row items-center gap-3">
      <input type="radio" class="radio checked:bg-blue-500" value="c" [(ngModel)]="$sequenceChoices" /> Choice C
    </div>
  </div>
  <button type="button" class="btn btn-primary" (click)="$sequenceChoices.next()">Next Choice</button>
</div>`,"resource-ref-to-promise/fake-resource-demo/fake-resource-demo.component.ts":`import { ChangeDetectionStrategy, Component, Injector, ResourceRef, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { resourceRefToPromise } from '@ddtmm/angular-signal-generators';

type FakeResourceRef<TValue> = Pick<ResourceRef<TValue>, 'error' | 'isLoading' | 'value'>;

@Component({
    selector: 'app-fake-resource-demo',
    imports: [FormsModule],
    templateUrl: './fake-resource-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FakeResourceDemoComponent {
  private readonly injector = inject(Injector);

  readonly $delayMs = signal(1200);
  readonly $lastError = signal<string | undefined>(undefined);
  readonly $lastResult = signal<string>('No result yet');
  readonly $activeResource = signal<FakeResourceRef<string> | undefined>(undefined);
  readonly $status = signal<'idle' | 'pending' | 'resolved' | 'rejected'>('idle');

  constructor() {
    effect(() => {
      const activeResource = this.$activeResource();
      if (!activeResource) {
        return;
      }
      activeResource.isLoading();
      activeResource.error();
      activeResource.value();
    });
  }

  runSuccessDemo(): void {
    const fakeResource = this.createDelayedFakeResource(
      () => \`Loaded fake profile at \${new Date().toLocaleTimeString()}\`,
      this.$delayMs(),
      false
    );
    this.awaitResource(fakeResource);
  }

  runErrorDemo(): void {
    const fakeResource = this.createDelayedFakeResource(
      () => 'Not used',
      this.$delayMs(),
      true
    );
    this.awaitResource(fakeResource);
  }

  private async awaitResource(fakeResource: FakeResourceRef<string>): Promise<void> {
    this.$activeResource.set(fakeResource);
    this.$status.set('pending');
    this.$lastError.set(undefined);
    this.$lastResult.set('Waiting for fake resource...');

    try {
      const value = await resourceRefToPromise(fakeResource as ResourceRef<string>, this.injector);
      this.$status.set('resolved');
      this.$lastResult.set(value);
    } catch (error: unknown)  { 
      this.$status.set('rejected');
      this.$lastError.set(error instanceof Error ? error.message : String(error));
    }
  }

  private createDelayedFakeResource(
    valueFactory: () => string,
    delayMs: number,
    shouldFail: boolean
  ): FakeResourceRef<string> {
    const $error = signal<Error | undefined>(undefined);
    const $isLoading = signal(true);
    const $value = signal<string>('');

    setTimeout(() => {
      if (shouldFail) {
        $error.set(new Error('Fake request failed.'));
      } else {
        $value.set(valueFactory());
      }
      $isLoading.set(false);
    }, delayMs);

    return {
      error: $error,
      isLoading: $isLoading,
      value: $value
    };
  }
}
`,"resource-ref-to-promise/fake-resource-demo/fake-resource-demo.component.html":`<div class="flex flex-col gap-4">
  <div class="grid sm:grid-cols-[auto,1fr] items-center gap-3">
    <label class="label" for="resourceDelay">Delay (ms)</label>
    <input id="resourceDelay" class="range range-primary" type="range" min="100" max="3000" step="100" [(ngModel)]="$delayMs" />
  </div>

  <div class="text-sm text-secondary">Current delay: {{$delayMs()}}ms</div>

  <div class="join">
    <button type="button" class="btn btn-primary join-item" (click)="runSuccessDemo()">Run Success Resource</button>
    <button type="button" class="btn btn-secondary join-item" (click)="runErrorDemo()">Run Error Resource</button>
  </div>

  <div class="grid md:grid-cols-2 gap-3">
    <div class="card card-compact shadow-lg bg-base-100">
      <div class="card-body">
        <div class="card-title text-base">Promise status</div>
        <div>{{$status()}}</div>
        <div>isLoading: {{$activeResource()?.isLoading() ?? false}}</div>
        <div>value: {{$activeResource()?.value() || '(none)'}}</div>
        <div>error: {{$activeResource()?.error()?.toString() || '(none)'}}</div>
      </div>
    </div>
    <div class="card card-compact shadow-lg bg-base-100">
      <div class="card-body">
        <div class="card-title text-base">Await result</div>
        <div>{{$lastResult()}}</div>
        @if ($lastError()) {
          <div class="text-error">{{$lastError()}}</div>
        }
      </div>
    </div>
  </div>
</div>
`,"resize-signal/resize-signal-demo/resize-signal-demo.component.ts":`import { ChangeDetectionStrategy, Component, ElementRef, computed, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { resizeSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-resize-signal-demo',
    imports: [FormsModule],
    templateUrl: './resize-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeSignalDemoComponent {
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $width = model<number>(50);
  readonly $resize = resizeSignal(this.$target);
  readonly $resizeResult = computed(() => {
    const change = this.$resize()[0];
    return !change
      ? 'No Changes'
      : \`Width - \${change.contentRect.width.toFixed(0)}.  Height - \${change.contentRect.height}.\`
  });
}
`,"resize-signal/resize-signal-demo/resize-signal-demo.component.html":`<div class="flex flex-col gap-3">
  <div class="flex flex-row gap-3">
    <label for="widthRange" class="whitespace-nowrap">Element Width</label>
    <input id="widthRange" type="range" min="0" max="100" class="range range-primary" [(ngModel)]="$width">
  </div>
  <div class="flex flex-row justify-center w-full">
    <div #targetEl class="rounded bg-secondary h-8" [style.width.%]="$width()" title="Adjustable Width Element">
    </div>
  </div>
  <div class="text-center">
    {{$resizeResult()}}
  </div>
</div>
`,"reduce-signal/search-history-demo/search-history-demo.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { reduceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-search-history-demo',
    imports: [CommonModule],
    templateUrl: './search-history-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchHistoryDemoComponent {
  readonly $searchText = signal('')
  readonly $searchHistory = reduceSignal<{ on: Date, value: string }[], string>([],
    (prior, x) => [...prior, { on: new Date(), value: x }]);

  doSearch(value: string): void {
    this.$searchHistory.set(value);
  }
}
`,"reduce-signal/search-history-demo/search-history-demo.component.html":`<div class="flex flex-row flex-wrap mb-2 gap-3">
  <input
    class="input"
    class="input input-bordered"
    type="text"
    #searchInput
    (keyup)="$searchText.set(searchInput.value)"
    (change)="$searchText.set(searchInput.value)"
    placeholder="Enter some text"
  />
  <button type="button" class="btn btn-primary" (click)="doSearch($searchText())" [disabled]="!$searchText()">Search</button>
</div>

<div class="card card-compact shadow-lg bg-base-100 ">
  <div class="card-body flex flex-col h-48">
    <div class="card-title">Search History</div>
    <div class="overflow-auto w-100 h-100">
      <ul class="list-inside list-disc">
        @for (historyItem of $searchHistory(); track historyItem) {
          <li>{{historyItem.on | date : 'medium'}}: {{ historyItem.value }}</li>
        }
      </ul>
    </div>
  </div>
</div>
`,"nest-signal/basic-demo/basic-demo.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { nestSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-basic-demo',
    imports: [CommonModule, FormsModule],
    templateUrl: './basic-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');
  readonly $state = nestSignal({ name: this.$name, luckyNumbers: this.$luckyNumbers });

  addLuckyNumber() {
    this.$luckyNumbers.update(numbers => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach(x => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
`,"nest-signal/basic-demo/basic-demo.component.html":`<div class="flex flex-col sm:flex-row gap-3">
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-3">
      <label class="label" for="demo_name">Name</label>
      <input class="input input-bordered" type="text" id="demo_name" [(ngModel)]="$name" />
    </div>
    <div class="px-1 flex flex-col gap-2">
      <div class="flex flex-row gap-2">
        <div >{{$name()}}'s Lucky Numbers:</div>
        <div class="flex flex-row gap-3">
          @for ($luckyNumber of $luckyNumbers(); track $luckyNumber) {
            <span>{{$luckyNumber()}}</span>
          }
        </div>
      </div>
      <div class="join">
        <button type="button" class="btn btn-primary btn-sm join-item" (click)="addLuckyNumber()">Add Lucky Number</button>
        <button type="button" class="btn btn-primary btn-sm join-item" (click)="reroll()">Reroll</button>
      </div>
    </div>
  </div>
  <div class="shadow-lg bg-base-100 rounded grow py-1 px-3">
    <div><b>State</b></div>
    <pre>{{$state() | json}}</pre>
  </div>
</div>
`,"mutation-signal/mutation-signal-demo/mutation-signal-demo.component.ts":`
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
      : \`Changed \${change.attributeName}.  Color is \${(change.target as HTMLElement).getAttribute(change.attributeName)}.\`;
  });
}
`,"mutation-signal/mutation-signal-demo/mutation-signal-demo.component.html":`<div class="flex flex-row gap-3">
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
`,"media-query-signal/media-query-signal-demo/media-query-signal-demo.component.ts":`
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { mediaQuerySignal, MediaQueryState } from '@ddtmm/angular-signal-generators';

interface QueryOption {
  formatFn: (value: MediaQueryState) => string;
  label: string;
  query: string;
  queryType: 'minWidth' | 'orientation';
}
@Component({
    selector: 'app-media-query-signal-demo',
    imports: [],
    templateUrl: './media-query-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaQuerySignalDemoComponent {
  readonly queries = [
    {
      formatFn: (x) => \`Orientation: \${x.matches ? 'Portrait' : 'Landscape'}\`,
      label: 'Orientation',
      query: '(orientation: portrait)',
      queryType: 'orientation'
    },
    {
      formatFn: (x) => \`\${x.matches ? 'Greater Than' : 'Less Than'} 600px\`,
      label: 'Min Width',
      query: '(min-width: 600px)',
      queryType: 'minWidth'
    }
  ] satisfies QueryOption[];

  readonly $query = signal<QueryOption>(this.queries[0]);
  readonly $matchMedia = mediaQuerySignal(() => this.$query().query);
  readonly $report = computed(() => this.$query().formatFn(this.$matchMedia()));
}
`,"media-query-signal/media-query-signal-demo/media-query-signal-demo.component.html":`<div class="flex flex-col gap-3">
  <div class="flex flex-row gap-3 items-center">
    Query
    <div class="join">
      @for (opt of queries; track opt.queryType) {
        <button type="button" class="btn btn-primary btn-sm join-item"
          [class.btn-active]="$query() === opt"
          (click)="$query.set(opt)">{{opt.label}}</button>
      }
    </div>
  </div>
  <div class="bg-secondary text-secondary-content text-center p-3">
    {{$report()}}
  </div>
</div>
`,"map-signal/math-demo/math-demo.component.ts":`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mapSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-math-demo',
    imports: [FormsModule],
    templateUrl: './math-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathDemoComponent {
  /** A value directly mapped.  */
  readonly $inputVal = mapSignal(1, x => x * this.$multiplier());
  readonly $multiplier = signal(2);
  /** Two signals mapped. */
  readonly $multiplierSquared = mapSignal(this.$inputVal, this.$multiplier, (a, b) => a * b);
}
`,"map-signal/math-demo/math-demo.component.html":`<div class="inline-block ">
  <div class="grid grid-cols-2 gap-x-4 gap-y-3">
    <label class="label" for="inputVal">Input Value</label>
    <input class="input input-bordered w-32 text-right" id="inputVal" type="number" [(ngModel)]="$inputVal.input" />
    <label class="label" for="multiplier">Multiplier</label>
    <input class="input input-bordered w-32 text-right" id="multiplier" type="number" [(ngModel)]="$multiplier" />
    <div class="label" >Output</div>
    <div class="self-center text-right w-32">{{$inputVal()}}</div>
    <div class="label" >Multiplier Squared</div>
    <div class="self-center text-right w-32">{{$multiplierSquared()}}</div>
  </div>
</div>
`,"lift-signal/array-demo/array-demo.component.ts":`import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { liftSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-array-demo',
    imports: [CommonModule],
    templateUrl: './array-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayDemoComponent {
  readonly $numbers = liftSignal(
    [this.randomNumber(), this.randomNumber(), this.randomNumber()],
    ['concat'], // updaters work great
    ['push', 'pop', 'shift'] // mutators are a bit iffy.
  );

  randomNumber(): number {
    return Math.floor(Math.random() * 100);
  }
}
`,"lift-signal/array-demo/array-demo.component.html":`<div class="flex flex-col gap-3">
  <div class="join">
    <button type="button" class="btn btn-primary join-item" (click)="$numbers.push(randomNumber())">Push</button>
    <button type="button" class="btn btn-primary join-item" (click)="$numbers.pop()">Pop</button>
    <button type="button" class="btn btn-primary join-item" (click)="$numbers.shift()">Shift</button>
    <button type="button" class="btn btn-primary join-item"
      (click)="$numbers.concat([randomNumber(), randomNumber()])">Concat</button>
  </div>
  <div class="flex flex-row gap-3 items-center">
    <div class="label">Array Value</div>
    {{$numbers() | json}}
  </div>
</div>
`,"intersection-signal/intersection-signal-demo/intersection-signal-demo.component.ts":`
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { intersectionSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-intersection-signal-demo',
    imports: [],
    templateUrl: './intersection-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntersectionSignalDemoComponent {
  readonly $root = viewChild<ElementRef>('rootEl');
  readonly $target = viewChild<ElementRef>('targetEl');
  readonly $intersection = intersectionSignal(this.$target, { root: this.$root() });
}
`,"intersection-signal/intersection-signal-demo/intersection-signal-demo.component.html":`<div class="overflow-x-auto w-full h-16 bg-secondary relative" #rootEl>
  <div class="w-[300%] text-secondary-content">
    <span class="absolute top-3 left-3"> Scroll Me Horizontally </span>
    <div class="w-8 h-8 mt-2 absolute bg-primary rounded left-[150%]" #targetEl></div>
  </div>
</div>
<div>
  {{$intersection().length > 0 && $intersection()[0].isIntersecting ? 'Is Intersecting' : 'Is Not Intersecting'}}
</div>
`,"inspect/inspect-component-signals-demo/inspect-component-signals-demo.component.ts":`
import { afterNextRender, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inspect } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-inspect-component-signals-demo',
    imports: [FormsModule],
    templateUrl: './inspect-component-signals-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectComponentSignalsDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');

  constructor() {
    /** This is the easiest way to use this! */
    inspect(this);
    afterNextRender(() => Array(3).fill(0).forEach(() => this.addLuckyNumber()));
  }
  addLuckyNumber() {
    this.$luckyNumbers.update(numbers => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach(x => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
`,"inspect/inspect-component-signals-demo/inspect-component-signals-demo.component.html":`<div class="flex flex-col gap-2">
  <div class="flex flex-row gap-3">
    <label class="label" for="demo_name">Name</label>
    <input class="input input-bordered" type="text" id="demo_name" [(ngModel)]="$name" />
  </div>
  <div class="px-1 flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <div >{{$name()}}'s Lucky Numbers:</div>
      <div class="flex flex-row gap-3">
        @for ($luckyNumber of $luckyNumbers(); track $luckyNumber) {
          <span>{{$luckyNumber()}}</span>
        }
      </div>
    </div>
    <div class="join">
      <button type="button" class="btn btn-primary btn-sm join-item" (click)="addLuckyNumber()">Add Lucky Number</button>
      <button type="button" class="btn btn-primary btn-sm join-item" (click)="reroll()">Reroll</button>
    </div>
  </div>
</div>
`,"inspect/basic-demo/basic-demo.component.ts":`
import { afterNextRender, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inspect } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-basic-demo',
    imports: [FormsModule],
    templateUrl: './basic-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');

  constructor() {
    inspect({ luckyNumbers: this.$luckyNumbers, name: this.$name }, { runInProdMode: true });
    afterNextRender(() => Array(3).fill(0).forEach(() => this.addLuckyNumber()));
  }
  addLuckyNumber() {
    this.$luckyNumbers.update(numbers => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach(x => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
`,"inspect/basic-demo/basic-demo.component.html":`<div class="flex flex-col gap-2">
  <div class="flex flex-row gap-3">
    <label class="label" for="demo_name">Name</label>
    <input class="input input-bordered" type="text" id="demo_name" [(ngModel)]="$name" />
  </div>
  <div class="px-1 flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <div >{{$name()}}'s Lucky Numbers:</div>
      <div class="flex flex-row gap-3">
        @for ($luckyNumber of $luckyNumbers(); track $luckyNumber) {
          <span>{{$luckyNumber()}}</span>
        }
      </div>
    </div>
    <div class="join">
      <button type="button" class="btn btn-primary btn-sm join-item" (click)="addLuckyNumber()">Add Lucky Number</button>
      <button type="button" class="btn btn-primary btn-sm join-item" (click)="reroll()">Reroll</button>
    </div>
  </div>
</div>
`,"inspect/alt-reporter-demo/alt-reporter-demo.component.ts":`
import { afterNextRender, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inspect, sequenceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-alt-reporter-demo',
    imports: [FormsModule],
    templateUrl: './alt-reporter-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AltReporterDemoComponent {
  /** This is a very contrived demonstration using nested signals. */
  readonly $luckyNumbers = signal<WritableSignal<number>[]>([]);
  readonly $name = signal('Danny');
  readonly $loggingEnabled = sequenceSignal([true, false]);
  constructor() {
    inspect(
      { enabled: this.$loggingEnabled, luckyNumbers: this.$luckyNumbers, name: this.$name },
      {
        reporter: (subject) => subject.enabled && console.log(\`%cCHANGE\\n%o\`, 'color: red; background: yellow', subject),
        runInProdMode: true,
        skipInitial: true
      }
    );
    afterNextRender(() => Array(3).fill(0).forEach(() => this.addLuckyNumber()));
  }
  addLuckyNumber() {
    this.$luckyNumbers.update((numbers) => [...numbers, signal(Math.floor(Math.random() * 49) + 1)]);
  }
  reroll() {
    this.$luckyNumbers().forEach((x) => x.set(Math.floor(Math.random() * 49) + 1));
  }
}
`,"inspect/alt-reporter-demo/alt-reporter-demo.component.html":`<div class="flex flex-col gap-2">
  <div class="flex flex-row gap-3">
    <label class="label" for="demo_name">Name</label>
    <input class="input input-bordered" type="text" id="demo_name" [(ngModel)]="$name" />
  </div>
  <div class="px-1 flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <div >{{$name()}}'s Lucky Numbers:</div>
      <div class="flex flex-row gap-3">
        @for ($luckyNumber of $luckyNumbers(); track $luckyNumber) {
          <span>{{$luckyNumber()}}</span>
        }
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <div class="join">
        <button type="button" class="btn btn-primary btn-sm join-item" (click)="addLuckyNumber()">Add Lucky Number</button>
        <button type="button" class="btn btn-primary btn-sm join-item" (click)="reroll()">Reroll</button>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" (click)="$loggingEnabled.next()">
        {{$loggingEnabled() ? 'Disable' : 'Enable'}} Log
      </button>
    </div>

  </div>
</div>
`,"filter-signal/filter-text-demo/filter-text-demo.component.ts":`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { filterSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-filter-text-demo',
    templateUrl: './filter-text-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTextDemoComponent {
  readonly maxLengthFilter = filterSignal<string>('', x => x.length < 5);
  readonly onlyLowerCaseFilter = filterSignal('', (x: string): x is Lowercase<string> => !/[A-Z]/.test(x));

  setFilters(value: string): void {
    this.maxLengthFilter.set(value);
    this.onlyLowerCaseFilter.set(value);
  }
}
`,"filter-signal/filter-text-demo/filter-text-demo.component.html":`<div class="flex flex-row flex-wrap -m-2">
  <div class="m-2">
    <input class="input" class="input input-bordered" type="text" #textInput
      (keyup)="setFilters(textInput.value)" placeholder="Enter some text" />
  </div>
</div>
<div class="flex flex-col sm:flex-row gap-3">
  <div class="flex-grow card card-compact shadow-lg">
    <div class="card-body flex flex-col items-center">
      <div class="label">Max Length Filter</div>
      <div class="h-7 text-lg">{{maxLengthFilter()}}</div>
    </div>
  </div>
  <div class="flex-grow card card-compact  shadow-lg">
    <div class="card-body flex flex-col items-center">
      <div class="label">Lower case Filter</div>
      <div class="h-7 text-lg">{{onlyLowerCaseFilter()}}</div>
    </div>
  </div>
</div>
`,"event-signal/from-string-literal-demo/from-string-literal-demo.component.ts":`
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { eventSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-from-string-literal-demo',
    imports: [FormsModule],
    templateUrl: './from-string-literal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FromStringLiteralDemoComponent {
  readonly $bodyInteraction = eventSignal('body', 'click',
    (event: MouseEvent) => \`Interacted with body at (\${event.clientX}, \${event.clientY})\`, { initialValue: 'No interactions yet'});
}
`,"event-signal/from-string-literal-demo/from-string-literal-demo.component.html":`<div>Touch or click body to view event</div>
<div>
  {{$bodyInteraction()}}
</div>

`,"event-signal/from-signal-demo/from-signal-demo.component.ts":`import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, LOCALE_ID, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { eventSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-from-signal-demo',
    imports: [CommonModule, FormsModule],
    templateUrl: './from-signal-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FromSignalDemoComponent {
  private readonly locale = inject(LOCALE_ID);
  readonly $active = computed(() => this.$selected() ?? this.$buttons()?.[0]);
  readonly $buttons = viewChildren<ElementRef<HTMLButtonElement>>('btn');
  readonly $selected = signal<ElementRef<HTMLButtonElement> | undefined>(undefined);
  readonly $lastEvent = eventSignal(this.$active,
    'click',
    (evt: Event) => \`\${(evt.target as HTMLElement).innerText} clicked at \${formatDate(Date.now(), 'hh:mm:ss.SSS a', 'en-US', this.locale)}\`,
    { initialValue: 'No clicks yet' }
  );
}
`,"event-signal/from-signal-demo/from-signal-demo.component.html":`<div class="flex flex-col gap-3">
  <div class="flex flex-row items-baseline gap-3">
    Monitor clicks from:
    <select class="select select-bordered select-sm" [ngModel]="$active()" (ngModelChange)="$selected.set($event)">
      @for (btn of $buttons(); track btn) {
        <option [ngValue]="btn">{{btn.nativeElement.innerText}}</option>
      }
    </select>
  </div>
  <div class="flex gap-2">
    <button type="button" class="btn btn-sm" [ngClass]="{ 'btn-primary': $active().nativeElement === btn1 }" #btn #btn1>Button 1</button>
    <button type="button" class="btn btn-sm" [ngClass]="{ 'btn-primary': $active().nativeElement === btn2 }" #btn #btn2>Button 2</button>
    <button type="button" class="btn btn-sm" [ngClass]="{ 'btn-primary': $active().nativeElement === btn3 }" #btn #btn3>Button 3</button>
  </div>
  <div>
    {{$lastEvent()}}
  </div>
</div>
`,"debounce-signal/indirect-demo/indirect-demo.component.ts":`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-indirect-demo',
    imports: [FormsModule],
    templateUrl: './indirect-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndirectDemoComponent {
  readonly $inputText = signal('')
  readonly $debounceTime = signal(500);
  readonly $debouncedText = debounceSignal(this.$inputText, this.$debounceTime);
}
`,"debounce-signal/indirect-demo/indirect-demo.component.html":`<div class="flex flex-row flex-wrap-reverse gap-3">
  <div>
    <label for="inputText" class="label">Input Value</label>
    <input id="inputText" class="input" type="text" [ngModel]="$inputText()" (ngModelChange)="$inputText.set($event)" />
  </div>
  <div class="w-48">
    <label for="debounceTime" class="label">Debounce Time: {{$debounceTime()}}</label>
    <input id="debounceTime" class="range range-primary" type="range" min="0" max="10000" [ngModel]="$debounceTime()"
      (ngModelChange)="$debounceTime.set($event)" />
  </div>
</div>
<div>
  <div class="text-secondary">Current Value: {{$inputText() || '(no value)'}}</div>
  <div class="text-secondary">Debounced Value: {{$debouncedText() || '(no value)'}}</div>
</div>
`,"debounce-signal/direct-demo/direct-demo.component.ts":`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceSignal } from '@ddtmm/angular-signal-generators';

@Component({
    selector: 'app-direct-demo',
    imports: [FormsModule],
    templateUrl: './direct-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectDemoComponent {
  readonly $debounceTime = signal(500);
  readonly $directDebounced = debounceSignal('', this.$debounceTime);
}
`,"debounce-signal/direct-demo/direct-demo.component.html":`<div class="flex flex-row flex-wrap-reverse gap-3">
  <div>
    <label for="inputText" class="label">Input Value</label>
    <input id="inputText" class="input" type="text" [(ngModel)]="$directDebounced" />
  </div>
  <div class="w-48">
    <label for="debounceTime" class="label">Debounce Time: {{$debounceTime()}}</label>
    <input id="debounceTime" class="range range-primary" type="range" min="0" max="10000" [(ngModel)]="$debounceTime" />
  </div>
</div>
<div>
  <div class="text-secondary">Current Value: {{$directDebounced() || '(no value)'}}</div>
</div>
`,"async-signal/customer-demo/shop.service.ts":`import { Injectable } from '@angular/core';
import { Observable, timer, map } from 'rxjs';

interface Entity {
  id: number;
  name: string;
}

const DEMO_DATA = {
  customers: [
    { "id": 1, "name": "Danny Gimenez" },
    { "id": 2, "name": "Joe Sanchez" },
    { "id": 3, "name": "Terry Terry" },
    { "id": 4, "name": "Suzan Sales" }
  ],
  orders: [
    { "id": 1, "customerId": 1, "products": [1, 3] },
    { "id": 2, "customerId": 2, "products": [2, 4] },
    { "id": 3, "customerId": 3, "products": [5, 7] },
    { "id": 4, "customerId": 4, "products": [6, 8] }
  ],
  products: [
    { "id": 1, "name": "Car" },
    { "id": 2, "name": "Dog" },
    { "id": 3, "name": "Bunny" },
    { "id": 4, "name": "Video Game" },
    { "id": 5, "name": "Atari" },
    { "id": 6, "name": "Rad Skate Board" },
    { "id": 7, "name": "Scary Terry Doll" },
    { "id": 8, "name": "Globe" }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  defaultExecutionTime = 2000;
  getCustomers(): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(map(() => [...DEMO_DATA.customers]));
  }
  getCustomerProducts(customerId: number): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(
      map(() =>
      DEMO_DATA.orders
          .filter((x) => x.customerId === customerId)
          .flatMap((x) => x.products.map((orderProductId) => DEMO_DATA.products.find((x) => x.id === orderProductId)))
          .filter((x): x is NonNullable<typeof x> => !!x)
      )
    );
  }

  getProducts(): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(map(() => [...DEMO_DATA.products]));
  }
}
`,"async-signal/customer-demo/customer-demo.component.ts":`import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { asyncSignal } from '@ddtmm/angular-signal-generators';
import { of, startWith } from 'rxjs';
import { ShopService } from './shop.service';

@Component({
    selector: 'app-customer-demo',
    templateUrl: './customer-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDemoComponent {
  private readonly shopSvc = inject(ShopService);
  /* Just a regular observable converted to a signal. */
  readonly $customers = toSignal(this.shopSvc.getCustomers().pipe(startWith(undefined)));
  readonly $id = signal(0);
  /** uses $id signal to get customer products */
  readonly $products = asyncSignal(() =>
    this.$id() !== 0 ? this.shopSvc.getCustomerProducts(this.$id()).pipe(startWith(undefined)) : of([]),
    { defaultValue: [] }
  );
}
`,"async-signal/customer-demo/customer-demo.component.html":`<div class="grid grid-flow-row md:grid-flow-col md:grid-cols-2 gap-3">
  <!-- customers column -->
  <div>
    <div class="font-semibold">Customers</div>
    @if ($id() === 0) {
      <span class="text-info">Click one to simulate loading</span>
    }
    @if (!$customers()) {
      <div>Loading <span class="loading loading-spinner loading-sm align-text-bottom text-info"></span></div>
    }
    @else {
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          @for (c of $customers(); track c.id) {
            <tr class="hover" (click)="$id.set(c.id)">
              <td>{{ c.id }}</td>
              <td>{{ c.name }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>
  <!-- products column -->
  <div>
    <div class="font-semibold">Products</div>
    @if ($id() === 0) {
      <span class="text-info">Select Customer to see Products</span>
    }
    @if (!$products()) {
      <div>Loading <span class="loading loading-spinner loading-sm align-text-bottom text-info"></span></div>
    }
    @else if ($products()?.length) {
      <table class="table">
        <thead>
          <tr>
            <th>Product Name</th>
          </tr>
        </thead>
        <tbody>
          @for (p of $products(); track p.id) {
            <tr>
              <td>{{ p.name }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>
</div>
`};var Y={"tsconfig.json":`/* To learn more about this file see: https://angular.io/config/tsconfig. */
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
`,"tsconfig.app.json":`/* To learn more about this file see: https://angular.io/config/tsconfig. */
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
`,"tailwind.config.js":`/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["light", "dark"],
  }
}

`,"package.json":`{
  "name": "angular-signal-generators-demo",
  "private": true,
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build"
  },
  "dependencies": {
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@ddtmm/angular-signal-generators": "^4.0.0",
    "rxjs": "^7.8.2",
    "tslib": "^2.6.2"
  },
  "devDependencies": {
    "@angular/build": "^21.0.0",
    "@angular/cli": "^21.0.0",
    "@angular/compiler-cli": "^21.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "autoprefixer": "^10.4.19",
    "daisyui": "^5.0.0",
    "postcss": "^8.5.4",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.9.3"
  },
  "overrides": {
    "@angular-devkit/build-angular": {
      "piscina": "~4.2.0"
    }
  }
}
`,"angular.json":`{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "newProjectRoot": "projects",
  "projects": {
    "demo": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "configurations": {
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            },
            "production": {
              "outputHashing": "all"
            }
            
          },
          "options": {
            "assets": [],
            "index": "src/index.html",
            "browser": "src/main.ts",
            "outputPath": "dist/demo",
            "scripts": [],
            "styles": ["src/styles.css"],
            "tsConfig": "tsconfig.app.json"
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "development": {
              "buildTarget": "demo:build:development"
            },
            "production": {
              "buildTarget": "demo:build:production"
            }
          },
          "defaultConfiguration": "development"
        }
      },
      "prefix": "app",
      "projectType": "application",
      "root": "",
      "schematics": {},
      "sourceRoot": "src"
    }
  },
  "version": 1
}
`,".postcssrc.json":`{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}`,"src/styles.css":`@import "tailwindcss";
@plugin "daisyui";`,"src/main.ts":`import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { $$DemoClass$$ } from './$$DemoPath$$';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [$$DemoClass$$],
  template: '<$$DemoSelector$$ />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent { }

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] });
`,"src/index.html":`<!DOCTYPE html>
<html lang="en" data-theme="light">
  <head>
    <title>My app</title>
    <meta charset="UTF-8" />
  </head>
  <body class="p-6 min-h-screen items-center flex flex-col gap-3">
    <app-root class="contents">
      <span class="text-xl">Angular Signal Generators</span>
      <img src="https://ddtmm.github.io/angular-signal-generators/assets/angular-signal-generators-logo.png" alt="project logo" class="w-20 inline" />
      <div>
        Demo Loading
        <span class="loading loading-spinner loading-sm align-text-bottom text-info"></span>
      </div>
    </app-root>
  </body>
</html>
`};var X=(()=>{class i{getSourceTypeFromFileName(e){switch(e.substring(e.lastIndexOf(".")+1)){case"html":return"html";case"ts":return"typescript";default:return"unknown"}}async openProject(e,n,t){if(typeof window<"u"){let o=await import("./chunk-V7RZ7QCK.js"),s=t?n.find(t):n.find(g=>g.type==="typescript");if(!s)throw new Error("No bootstrap component file found");let a=s.path.replace(/\.ts$/,""),l=/export\s+class\s+(\w+)/.exec(s.code)?.[1]??"** MISSING CLASS **",b=/selector:\s*'([^']+)'/.exec(s.code)?.[1]??"** MISSING SELECTOR **",p=n.reduce((g,x)=>(g[r(x)]=x.code,g),{}),J=Object.entries(Y).reduce((g,[x,ee])=>(g[x]=ee.replaceAll("$$DemoClass$$",l).replaceAll("$$DemoPath$$",a).replaceAll("$$DemoSelector$$",b),g),{}),K={title:e,template:"node",files:f(f({},p),J)};o.default.openProject(K,{openFile:[r(s)],newWindow:!0})}function r(o){return`src/${o.path.replace(/^\//,"")}`}}getSourceFiles(e){let n=Object.entries(F).filter(([o])=>e.test(o)),t=r(n.map(([o])=>o));return Object.entries(F).filter(([o])=>e.test(o)).map(([o,s])=>{let a=o.substring(o.lastIndexOf("/")+1),l=this.getSourceTypeFromFileName(a);return{code:s,name:a,path:o.replace(t,""),type:l}});function r(o){if(o.length===0)return"";let s=o[0].split("/");for(let a=1;a<o.length;a++){let l=o[a].split("/").map((b,p)=>b===s[p]);s=s.filter((b,p)=>l[p])}return s.join("/")}}static{this.\u0275fac=function(n){return new(n||i)}}static{this.\u0275prov=N({token:i,factory:i.\u0275fac,providedIn:"root"})}}return i})();var te=["*"],Z=i=>({"tab-active":i}),oe=(i,u)=>u.name;function ie(i,u){if(i&1){let e=q();d(0,"button",11),C("click",function(){let t=R(e).$implicit,r=k();return O(r.$selectedTab.set(t.id))}),h(1),m()}if(i&2){let e=u.$implicit,n=k();$("ngClass",M(2,Z,n.$selectedTab()===e.id)),c(),z(" ",e.label," ")}}function ae(i,u){i&1&&(d(0,"div",9),V(1),m())}function re(i,u){if(i&1&&(d(0,"div",10),w(1,"app-code-block",12),m()),i&2){let e=u;c(),$("content",e.code)("language",e.type)("name",e.name)}}var Se=(()=>{class i{constructor(){this.demoSvc=E(X),this.demoTabId="_demo_",this.$hiddenPattern=y(void 0,{alias:"hiddenPattern"}),this.$name=y.required({alias:"name"}),this.$pattern=y.required({alias:"pattern"}),this.$primaryComponentPattern=y(void 0,{alias:"primaryComponentPattern"}),this.$selectedTab=j(this.demoTabId),this.$sources=v(()=>{let e=new RegExp(this.$pattern());return this.demoSvc.getSourceFiles(e)}),this.$visibleSources=v(()=>{let e=this.$visibleFilesFinder(),n=this.$primaryComponentFinder(),t=this.$sources().filter(e),r=t.map((a,l)=>T(f({},a),{label:t.length<=2&&this.typeLabels[a.type]||a.name,id:l})),o=r.find(n)?.name||"_NO_MATCH_.zzz",s=o.substring(0,o.lastIndexOf("."));return r.sort((a,l)=>{if(a.name===o)return-1;if(l.name===o)return 1;let b=a.name.substring(0,a.name.lastIndexOf(".")),p=l.name.substring(0,l.name.lastIndexOf("."));if(b===p){if(a.type==="typescript")return-1;if(l.type==="typescript")return 1}return a.name.substring(0,a.name.lastIndexOf("."))===s?-1:l.name.substring(0,l.name.lastIndexOf("."))===s?1:a.name<l.name?-1:1}),r}),this.$selectedSource=G(this.$selectedTab,this.$visibleSources,(e,n)=>n.find(t=>t.id===e)),this.$visibleFilesFinder=v(()=>{let e=this.$hiddenPattern();if(e){let n=new RegExp(e);return t=>!n.test(t.name)}return()=>!0}),this.$primaryComponentFinder=v(()=>{let e=this.$primaryComponentPattern();if(e){let n=new RegExp(e);return t=>n.test(t.name)}return n=>n.type==="typescript"}),this.typeLabels={html:"HTML",typescript:"TypeScript"}}openProject(){this.demoSvc.openProject(this.$name(),this.$sources(),this.$primaryComponentFinder())}static{this.\u0275fac=function(n){return new(n||i)}}static{this.\u0275cmp=P({type:i,selectors:[["app-demo-host"]],inputs:{$hiddenPattern:[1,"hiddenPattern","$hiddenPattern"],$name:[1,"name","$name"],$pattern:[1,"pattern","$pattern"],$primaryComponentPattern:[1,"primaryComponentPattern","$primaryComponentPattern"]},ngContentSelectors:te,decls:15,vars:6,consts:[[1,"flex","flex-row","gap-3"],[1,"mb-1","text-xl","text-secondary"],["type","button","title","Open in StackBlitz",1,"btn","btn-secondary","btn-outline","btn-sm",3,"click"],["alt","Open in StackBlitz","src","assets/stackblitz-icon.svg",1,"m-0","w-4"],[1,"hidden","sm:inline"],[1,"pt-3","max-w-full"],["role","tablist",1,"tabs","tabs-boxed","z-10","justify-self-start","mb-1"],["role","tab",1,"tab",3,"click","ngClass"],["role","tab",1,"tab","text-nowrap",3,"ngClass"],["role","tab",1,"border","border-base-300","bg-slate-50","dark:bg-slate-800","w-full","p-3","shadow-lg"],["role","tab",1,"relative","border","border-base-300","w-full","shadow-lg"],["role","tab",1,"tab","text-nowrap",3,"click","ngClass"],[1,"max-h-[400px]",3,"content","language","name"]],template:function(n,t){if(n&1&&(_(),d(0,"div",0)(1,"div",1),h(2),m(),d(3,"button",2),C("click",function(){return t.openProject()}),w(4,"img",3),d(5,"span",4),h(6,"StackBlitz"),m()()(),d(7,"div",5)(8,"div",6)(9,"button",7),C("click",function(){return t.$selectedTab.set(t.demoTabId)}),h(10," Demo "),m(),I(11,ie,2,4,"button",8,oe),m(),S(13,ae,2,0,"div",9),S(14,re,2,3,"div",10),m()),n&2){let r;c(2),A(t.$name()),c(7),$("ngClass",M(4,Z,t.$selectedTab()===t.demoTabId)),c(2),L(t.$visibleSources()),c(2),D(t.$selectedTab()===t.demoTabId?13:-1),c(),D((r=t.$selectedSource())?14:-1,r)}},dependencies:[Q,H,U,W,B],encapsulation:2,changeDetection:0})}}return i})();export{Se as a};
