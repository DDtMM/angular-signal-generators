export default {
  "tween-signal/simple-demo/simple-demo.component.ts": "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\r\nimport { EasingFn, easeInBack , tweenSignal } from '@ddtmm/angular-signal-generators';\r\nimport { EasingSelectorComponent } from '../shared/easing-selector.component';\r\n\r\n@Component({\r\n  selector: 'app-simple-demo',\r\n  standalone: true,\r\n  imports: [EasingSelectorComponent],\r\n  templateUrl: './simple-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class SimpleDemoComponent {\r\n  readonly $easingFn = signal<EasingFn>(easeInBack);\r\n  readonly $sliderValue = tweenSignal(0, { easing: this.$easingFn() });\r\n}\r\n",
  "tween-signal/simple-demo/simple-demo.component.html": "<div class=\"flex flex-row gap-3 items-center pb-3\">\r\n  <span>Easing Function</span>\r\n  <app-easing-selector [(easingFn)]=\"$easingFn\" (easingFnChange)=\"$sliderValue.setOptions({ easing: $easingFn() })\" />\r\n</div>\r\n<div class=\"flex flex-col w-full sm:flex-row items-center gap-3\">\r\n  <div class=\"flex-none\">\r\n    <div class=\"join\">\r\n      <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$sliderValue.set(0)\">0%</button>\r\n      <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$sliderValue.set(50)\">50%</button>\r\n      <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$sliderValue.set(100)\">100%</button>\r\n    </div>\r\n  </div>\r\n  <div>\r\n    <input class=\"range range-primary\" type=\"range\" [value]=\"$sliderValue()\" min=\"0\" max=\"100\" />\r\n  </div>\r\n</div>\r\n",
  "tween-signal/shared/easing-selector.component.ts": "import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { EasingFn, easeInBack, easings } from '@ddtmm/angular-signal-generators';\r\n\r\ntype EasingFnName = keyof typeof easings;\r\n\r\n@Component({\r\n  selector: 'app-easing-selector',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  template: `\r\n  <select class=\"select select-primary select-sm\" [ngModel]=\"$easingFnName()\" (ngModelChange)=\"setEasingFn($event)\">\r\n    @for (easing of easingNames; track easing) {\r\n      <option [value]=\"easing\">{{easing}}</option>\r\n    }\r\n  </select>\r\n  `,\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class EasingSelectorComponent {\r\n  readonly easingNames = Object.keys(easings) as EasingFnName[];\r\n  readonly $easingFn = model<EasingFn>(easeInBack, { alias: 'easingFn'});\r\n  readonly $easingFnName = computed<EasingFnName>(() => this.getEasingName(this.$easingFn()));\r\n\r\n  /** Retrieves the name of the easing function based on the provided easing function or returns \"linear\". */\r\n  getEasingName(easingFn: EasingFn): EasingFnName {\r\n    return Object.entries(easings).find(([, value]) => value === easingFn)?.[0] as EasingFnName || 'linear';\r\n  }\r\n\r\n  /** Sets $easingFn based on the provided easingFnName. */\r\n  setEasingFn(easingFnName: EasingFnName): void {\r\n    this.$easingFn.set(easings[easingFnName]);\r\n  }\r\n}\r\n",
  "tween-signal/multiple-numbers-demo/multiple-numbers-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component, signal } from '@angular/core';\r\nimport { EasingFn, easeInBack, tweenSignal } from '@ddtmm/angular-signal-generators';\r\nimport { EasingSelectorComponent } from '../shared/easing-selector.component';\r\n\r\n@Component({\r\n  selector: 'app-multiple-numbers-demo',\r\n  standalone: true,\r\n  imports: [CommonModule, EasingSelectorComponent],\r\n  templateUrl: './multiple-numbers-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class MultipleNumbersDemoComponent {\r\n  readonly $easingFn = signal<EasingFn>(easeInBack);\r\n  readonly $coords = tweenSignal([0, 0], { easing: this.$easingFn() });\r\n}\r\n",
  "tween-signal/multiple-numbers-demo/multiple-numbers-demo.component.html": "<p>\r\n  You can tween between array values of equal length.\r\n  Here the array is an set of coordinates that changes with each change of the control surface.\r\n</p>\r\n<div class=\"flex flex-row gap-3 items-center pb-3\">\r\n  <span>Easing Function</span>\r\n  <app-easing-selector [(easingFn)]=\"$easingFn\" (easingFnChange)=\"$coords.setOptions({ easing: $easingFn() })\" />\r\n</div>\r\n<div class=\"cursor-pointer w-36 h-36 bg-green-600 rounded-lg border-slate-900 border-solid border\"\r\n  (click)=\"$coords.set([$event.offsetX - 8, $event.offsetY - 8])\">\r\n  <div class=\"w-4 h-4 bg-slate-900 rounded-full\"\r\n    [ngStyle]=\"{ 'translate': $coords()[0] + 'px ' + $coords()[1] + 'px' }\">\r\n  </div>\r\n</div>\r\n",
  "tween-signal/interpolation-demo/interpolation-demo.component.ts": "import { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { InterpolateStepFn, sequenceSignal, tweenSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-interpolation-demo',\r\n  standalone: true,\r\n  templateUrl: './interpolation-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class InterpolationDemoComponent {\r\n  readonly $stringInterpolationSequence = sequenceSignal([\r\n    'Press the button to see lame typing effect.',\r\n    'I should put something funny here!',\r\n    'Does anybody know what a typewriter is?'\r\n  ]);\r\n  readonly $stringInterpolationTween = tweenSignal(this.$stringInterpolationSequence, {\r\n    duration: 2000,\r\n    interpolator: stringInterpolationFactory\r\n  });\r\n}\r\n\r\n/** Weights the interpolation so the second half takes longer than the first. */\r\nfunction stringInterpolationFactory(a: string, b: string): InterpolateStepFn<string> {\r\n  const midPoint = (a.length / Math.max(1, a.length + b.length)) * 0.25;\r\n\r\n  return (progress: number): string => {\r\n    switch (progress) {\r\n      case 0:\r\n        return a;\r\n      case 1:\r\n        return b;\r\n      default: {\r\n        const aProgress = midPoint !== 0 ? Math.min(1, progress / midPoint) : 1;\r\n        const bProgress = midPoint !== 1 ? Math.max(0, (progress - midPoint) / (1 - midPoint)) : 1;\r\n        return a.slice(0, Math.floor((1 - aProgress) * a.length)) + b.slice(0, Math.floor(bProgress * b.length));\r\n      }\r\n    }\r\n  };\r\n}\r\n",
  "tween-signal/interpolation-demo/interpolation-demo.component.html": "<div class=\"flex flex-col items-center sm:items-start gap-3\">\r\n  <div>\r\n    You can tween between anything as long as there is an interpolation function that can translate progress into a value.\r\n  </div>\r\n  <div class=\"flex flex-row w-full gap-3 \">\r\n    <div>\r\n      <button type=\"button\" class=\"btn btn-primary\" (click)=\"$stringInterpolationSequence.next()\">Type</button>\r\n    </div>\r\n    <div class=\"chat chat-start grow\">\r\n      <div class=\"chat-bubble\" [ariaDescription]=\"$stringInterpolationSequence()\">\r\n        <span aria-hidden=\"true\">{{$stringInterpolationTween()}}</span>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n",
  "timer-signal/timer-signal-demo/timer-signal-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { sequenceSignal, timerSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-timer-signal-demo',\r\n  standalone: true,\r\n  imports: [CommonModule, FormsModule],\r\n  templateUrl: './timer-signal-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class TimerSignalDemoComponent {\r\n\r\n  readonly $executions = signal(0);\r\n  readonly $intervalRange = signal(500);\r\n  readonly $mode = sequenceSignal(['interval', 'timeout'] as const);\r\n  readonly $timer = computed(() => this.$mode() === 'timeout' ? this.$timeoutTimer : this.$intervalTimer);\r\n  readonly $timeoutRange = signal(500);\r\n  // timer signal and SSR don't mix.\r\n  readonly $intervalTimer = timerSignal(this.$timeoutRange, this.$intervalRange);\r\n  // timer signal and SSR don't mix.\r\n  readonly $timeoutTimer = timerSignal(this.$timeoutRange);\r\n\r\n  constructor() {\r\n    // This is a good example of the danger of using effects to try to maintain a state.\r\n    // There is the possibility that timer ticks will be missed and the count of $executions will be wrong.\r\n    effect(() => {\r\n      const timerValue = this.$timer()();\r\n      if (timerValue !== 0) {\r\n        this.$executions.update(x => ++x);\r\n      }\r\n    }, { allowSignalWrites: true });\r\n  }\r\n\r\n  toggleMode(): void {\r\n    this.$timer().pause();\r\n    this.$mode.next();\r\n    this.$timer().restart();\r\n  }\r\n}\r\n",
  "timer-signal/timer-signal-demo/timer-signal-demo.component.html": "<div class=\"flex flex-col w-full sm:flex-row gap-3\">\r\n  <div>\r\n    <p>You controls to below to manipulate the timer.  The right-most button will toggle between interval and timeout modes.</p>\r\n    <div class=\"flex flex-row gap-2\">\r\n      <button type=\"button\" class=\"btn btn-secondary join-item\" (click)=\"toggleMode()\">{{ $mode() }} Mode</button>\r\n      <div class=\"join gap-0\">\r\n        <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$timer().pause()\" [disabled]=\"$timer().state() !== 'running'\">Pause</button>\r\n        <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$timer().resume()\" [disabled]=\"$timer().state() !== 'paused'\">Resume</button>\r\n        <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$timer().restart()\">Restart</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"flex-grow w-full\">\r\n    <div>\r\n      <label class=\"label\">Timeout Time: {{$timeoutRange()}}</label>\r\n      <input class=\"range range-primary\" type=\"range\" min=\"0\" max=\"10000\" [(ngModel)]=\"$timeoutRange\" />\r\n    </div>\r\n    <div>\r\n      <label class=\"label\" >Interval Time: {{$intervalRange()}}</label>\r\n      <input class=\"range\" type=\"range\" min=\"0\" max=\"10000\" [(ngModel)]=\"$intervalRange\"\r\n        [ngClass]=\"$mode() === 'interval' ? 'range-primary' : 'range-accent'\"\r\n        [disabled]=\"$mode() === 'timeout'\" />\r\n    </div>\r\n  </div>\r\n</div>\r\n<div class=\"flex flex-col w-full sm:flex-row gap-3 pt-3\">\r\n  <div class=\"flex-grow card card-compact shadow-lg bg-base-100\">\r\n    <div class=\"card-body flex flex-col items-center\">\r\n      <div>Ticks since Restart</div>\r\n      <div class=\"h-7 text-lg\">{{$timer()()}}</div>\r\n    </div>\r\n  </div>\r\n  <div class=\"flex-grow card card-compact shadow-lg bg-base-100\">\r\n    <div class=\"card-body flex flex-col items-center\">\r\n      <div>Total Ticks</div>\r\n      <div class=\"h-7 text-lg\">{{$executions()}}</div>\r\n    </div>\r\n  </div>\r\n</div>\r\n",
  "storage-signal/custom-storage-demo/custom-storage-demo.component.ts": "import { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { toSignal } from '@angular/core/rxjs-interop';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { StorageSignalStore, storageSignal } from '@ddtmm/angular-signal-generators';\r\nimport { Subject, scan } from 'rxjs';\r\n\r\n@Component({\r\n  selector: 'app-custom-storage-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './custom-storage-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class CustomStorageDemoComponent {\r\n  private readonly storageProvider = new StorageSpy();\r\n  readonly $eventLog = toSignal(this.storageProvider.events$.pipe(scan((acc, cur) => [...acc, cur], [] as string[])));\r\n  readonly $stored = storageSignal('Change Me', 'demos-custom-storage-greeting', this.storageProvider);\r\n}\r\n\r\nclass StorageSpy implements StorageSignalStore<string> {\r\n  readonly events$ = new Subject<string>();\r\n  readonly storage: Storage | undefined = globalThis.sessionStorage;\r\n  get(key: string): string | undefined {\r\n    this.events$.next(`Retrieved ${key}.`);\r\n    return this.storage?.getItem(key) ?? undefined;\r\n  }\r\n  set(key: string, value: string): void {\r\n    this.events$.next(`Stored ${key} with the value \"${value}\".`);\r\n    this.storage?.setItem(key, value);\r\n  }\r\n}\r\n",
  "storage-signal/custom-storage-demo/custom-storage-demo.component.html": "<p>Custom providers can be used in a storage signal.  In this case a spy functionality is part of the provided store.</p>\r\n<div class=\"grid grid-cols-[auto,1fr] gap-3 items-start\">\r\n\r\n    <label class=\"label text-nowrap\" for=\"inputVal\">Input Value</label>\r\n    <input type=\"text\" class=\"input input-bordered \" id=\"inputVal\" [(ngModel)]=\"$stored\" />\r\n    <div class=\"label\">Events</div>\r\n    <ul class=\"p-3 border border-neutral-400 rounded-lg bg-neutral-200\">\r\n      @for (l of $eventLog(); track $index) {\r\n        <li>{{l}}</li>\r\n      }\r\n    </ul>\r\n\r\n</div>\r\n",
  "storage-signal/built-in-storage-demo/built-in-storage-demo.component.ts": "import { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { sessionStorageSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-built-in-storage-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './built-in-storage-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class BuiltInStorageDemoComponent {\r\n  readonly $stored = sessionStorageSignal('Change Me', 'demos-built-in-storage-greeting');\r\n}\r\n",
  "storage-signal/built-in-storage-demo/built-in-storage-demo.component.html": "<p>Refresh the page to see the value below persisted in session storage.</p>\r\n<div class=\"flex flex-row gap-3 \">\r\n  <label class=\"label\" for=\"inputVal\">Input Value</label>\r\n  <input type=\"text\" class=\"input input-bordered flex-grow\" id=\"inputVal\" [(ngModel)]=\"$stored\" />\r\n</div>\r\n",
  "sequence-signal/toggle-demo/toggle-demo.component.ts": "import { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { sequenceSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-toggle-demo',\r\n  standalone: true,\r\n  imports: [],\r\n  templateUrl: './toggle-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class ToggleDemoComponent {\r\n  readonly $trueFalseToggle = sequenceSignal([true, false]);\r\n}\r\n",
  "sequence-signal/toggle-demo/toggle-demo.component.html": "<div>\r\n  <button type=\"button\" class=\"btn btn-primary\" (click)=\"$trueFalseToggle.next()\">TOGGLE ME</button>\r\n  <label class=\"label\">Current Value</label>\r\n  <div>{{$trueFalseToggle()}}</div>\r\n</div>\r\n",
  "sequence-signal/fibonacci-demo/fibonacci-demo.component.ts": "import { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { sequenceSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-fibonacci-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './fibonacci-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class FibonacciDemoComponent {\r\n  readonly $fibonacci = sequenceSignal((() => {\r\n    let values = [1, 2];\r\n    return {\r\n      next: (relativeChange: number) => {\r\n        for (let i = 0; i < relativeChange; i++) {\r\n          values = [values[1], values[0] + values[1]];\r\n        }\r\n        for (let i = relativeChange; i < 0; i++) {\r\n          values = [Math.max(1, values[1] - values[0]), Math.max(values[0], 2)];\r\n        }\r\n        return { hasValue: true, value: values[0] };\r\n      },\r\n      reset: () => values = [1, 2]\r\n    };\r\n  })());\r\n  fibonacciStepSize = 1;\r\n}\r\n",
  "sequence-signal/fibonacci-demo/fibonacci-demo.component.html": "<div class=\"flex flex-row items-center\">\r\n  <div class=\"flex flex-col text-center px-3\">\r\n    <div class=\"label\">Value</div>\r\n    <div class=\"text-lg\">{{$fibonacci()}}</div>\r\n  </div>\r\n  <div class=\"px-3\">\r\n    <label class=\"label\">Step Size: {{fibonacciStepSize}}</label>\r\n    <input class=\"range\" type=\"range\" min=\"-10\" max=\"10\" [(ngModel)]=\"fibonacciStepSize\" />\r\n  </div>\r\n  <button type=\"button\" class=\"btn btn-primary\" (click)=\"$fibonacci.next(fibonacciStepSize)\">Next</button>\r\n</div>\r\n",
  "resize-signal/resize-signal-demo/resize-signal-demo.component.ts": "import { ChangeDetectionStrategy, Component, ElementRef, computed, model, viewChild } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { resizeSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-resize-signal-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './resize-signal-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class ResizeSignalDemoComponent {\r\n  readonly $target = viewChild<ElementRef>('targetEl');\r\n  readonly $width = model<number>(50);\r\n  readonly $resize = resizeSignal(this.$target);\r\n  readonly $resizeResult = computed(() => {\r\n    const change = this.$resize()[0];\r\n    return !change\r\n      ? 'No Changes'\r\n      : `Width - ${change.contentRect.width.toFixed(0)}.  Height - ${change.contentRect.height}.`\r\n  });\r\n}\r\n",
  "resize-signal/resize-signal-demo/resize-signal-demo.component.html": "<div class=\"flex flex-col gap-3\">\r\n  <div class=\"flex flex-row gap-3\">\r\n    <label for=\"widthRange\" class=\"whitespace-nowrap\">Element Width</label>\r\n    <input id=\"widthRange\" type=\"range\" min=\"0\" max=\"100\" class=\"range range-primary\" [(ngModel)]=\"$width\">\r\n  </div>\r\n  <div class=\"flex flex-row justify-center w-full\">\r\n    <div #targetEl class=\"rounded bg-secondary h-8\" [style.width.%]=\"$width()\" title=\"Adjustable Width Element\">\r\n    </div>\r\n  </div>\r\n  <div class=\"text-center\">\r\n    {{$resizeResult()}}\r\n  </div>\r\n</div>\r\n",
  "reduce-signal/search-history-demo/search-history-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component, signal } from '@angular/core';\r\nimport { reduceSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-search-history-demo',\r\n  standalone: true,\r\n  imports: [CommonModule],\r\n  templateUrl: './search-history-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class SearchHistoryDemoComponent {\r\n  readonly $searchText = signal('')\r\n  readonly $searchHistory = reduceSignal<{ on: Date, value: string }[], string>([],\r\n    (prior, x) => [...prior, { on: new Date(), value: x }]);\r\n\r\n  doSearch(value: string): void {\r\n    this.$searchHistory.set(value);\r\n  }\r\n}\r\n",
  "reduce-signal/search-history-demo/search-history-demo.component.html": "<div class=\"flex flex-row flex-wrap mb-2 gap-3\">\r\n  <input\r\n    class=\"input\"\r\n    class=\"input input-bordered\"\r\n    type=\"text\"\r\n    #searchInput\r\n    (keyup)=\"$searchText.set(searchInput.value)\"\r\n    (change)=\"$searchText.set(searchInput.value)\"\r\n    placeholder=\"Enter some text\"\r\n  />\r\n  <button type=\"button\" class=\"btn btn-primary\" (click)=\"doSearch($searchText())\" [disabled]=\"!$searchText()\">Search</button>\r\n</div>\r\n\r\n<div class=\"card card-compact shadow-lg bg-base-100 \">\r\n  <div class=\"card-body flex flex-col h-48\">\r\n    <div class=\"card-title\">Search History</div>\r\n    <div class=\"overflow-auto w-100 h-100\">\r\n      <ul class=\"list-inside list-disc\">\r\n        @for (historyItem of $searchHistory(); track historyItem) {\r\n          <li>{{historyItem.on | date : 'medium'}}: {{ historyItem.value }}</li>\r\n        }\r\n      </ul>\r\n    </div>\r\n  </div>\r\n</div>\r\n",
  "mutation-signal/mutation-signal-demo/mutation-signal-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';\r\nimport { mutationSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-mutation-signal-demo',\r\n  standalone: true,\r\n  imports: [CommonModule],\r\n  templateUrl: './mutation-signal-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class MutationSignalDemoComponent {\r\n  readonly $color = signal<string>('');\r\n  readonly $target = viewChild<ElementRef>('targetEl');\r\n  readonly $mutation = mutationSignal(this.$target);\r\n  readonly $mutationResult = computed(() => {\r\n    const change = this.$mutation()[0];\r\n    return !change\r\n      ? 'No Changes'\r\n      : `Changed ${change.attributeName}.  Color is ${(change.target as HTMLElement).getAttribute(change.attributeName!)}.`\r\n  });\r\n}\r\n",
  "mutation-signal/mutation-signal-demo/mutation-signal-demo.component.html": "<div class=\"flex flex-row gap-3\">\r\n  <div class=\"join\">\r\n    <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$color.set('red')\">Red</button>\r\n    <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$color.set('green')\">Green</button>\r\n    <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$color.set('blue')\">Blue</button>\r\n  </div>\r\n  <div class=\"text-center border border-solid rounded grow\">\r\n    <div #targetEl class=\"p-3\" [style]=\"{ color: $color() }\">Change Me</div>\r\n  </div>\r\n</div>\r\n<div>\r\n  Last Change: {{$mutationResult()}}\r\n</div>\r\n",
  "map-signal/math-demo/math-demo.component.ts": "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { mapSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-math-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './math-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class MathDemoComponent {\r\n  /** A value directly mapped.  */\r\n  readonly $inputVal = mapSignal(1, x => x * this.$multiplier());\r\n  readonly $multiplier = signal(2);\r\n  /** Two signals mapped. */\r\n  readonly $multiplierSquared = mapSignal(this.$inputVal, this.$multiplier, (a, b) => a * b);\r\n}\r\n",
  "map-signal/math-demo/math-demo.component.html": "<div class=\"inline-block \">\r\n  <div class=\"grid grid-cols-2 gap-x-4 gap-y-3\">\r\n    <label class=\"label\" for=\"inputVal\">Input Value</label>\r\n    <input class=\"input input-bordered w-32 text-right\" id=\"inputVal\" type=\"number\" [ngModel]=\"$inputVal.input()\" (ngModelChange)=\"$inputVal.set($event)\" />\r\n    <label class=\"label\" for=\"multiplier\">Multiplier</label>\r\n    <input class=\"input input-bordered w-32 text-right\" id=\"multiplier\" type=\"number\" [(ngModel)]=\"$multiplier\" />\r\n    <div class=\"label\" >Output</div>\r\n    <div class=\"self-center text-right w-32\">{{$inputVal()}}</div>\r\n    <div class=\"label\" >Multiplier Squared</div>\r\n    <div class=\"self-center text-right w-32\">{{$multiplierSquared()}}</div>\r\n  </div>\r\n</div>\r\n",
  "lift-signal/array-demo/array-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { liftSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-array-demo',\r\n  standalone: true,\r\n  imports: [CommonModule],\r\n  templateUrl: './array-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class ArrayDemoComponent {\r\n  readonly $numbers = liftSignal(\r\n    [this.randomNumber(), this.randomNumber(), this.randomNumber()],\r\n    ['concat'], // updaters work great\r\n    ['push', 'pop', 'shift'] // mutators are a bit iffy.\r\n  );\r\n\r\n  randomNumber(): number {\r\n    return Math.floor(Math.random() * 100);\r\n  }\r\n}\r\n",
  "lift-signal/array-demo/array-demo.component.html": "<p>\r\n  You can easily lift the methods on from any object to the signal.\r\n  Here various array methods are lifted and directly accessed.\r\n</p>\r\n<div class=\"flex flex-col gap-3\">\r\n  <div class=\"join\">\r\n    <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$numbers.push(randomNumber())\">Push</button>\r\n    <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$numbers.pop()\">Pop</button>\r\n    <button type=\"button\" class=\"btn btn-primary join-item\" (click)=\"$numbers.shift()\">Shift</button>\r\n    <button type=\"button\" class=\"btn btn-primary join-item\"\r\n      (click)=\"$numbers.concat([randomNumber(), randomNumber()])\">Concat</button>\r\n  </div>\r\n  <div class=\"flex flex-row gap-3 items-center\">\r\n    <label class=\"label\">Array Value</label>\r\n    {{$numbers() | json}}\r\n  </div>\r\n</div>\r\n",
  "intersection-signal/intersection-signal-demo/intersection-signal-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';\r\nimport { intersectionSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-intersection-signal-demo',\r\n  standalone: true,\r\n  imports: [CommonModule],\r\n  templateUrl: './intersection-signal-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class IntersectionSignalDemoComponent {\r\n  readonly $root = viewChild<ElementRef>('rootEl');\r\n  readonly $target = viewChild<ElementRef>('targetEl');\r\n  readonly $intersection = intersectionSignal(this.$target, { root: this.$root() });\r\n}\r\n",
  "intersection-signal/intersection-signal-demo/intersection-signal-demo.component.html": "<div class=\"overflow-x-auto w-full h-16 bg-secondary relative\" #rootEl>\r\n  <div class=\"w-[300%] text-secondary-content\">\r\n    <span class=\"absolute top-3 left-3\"> Scroll Me </span>\r\n    <div class=\"w-8 h-8 mt-2 absolute bg-primary rounded left-[150%]\" #targetEl></div>\r\n  </div>\r\n</div>\r\n<div>\r\n  {{$intersection().length > 0 && $intersection()[0].isIntersecting ? 'Is Intersecting' : 'Is Not Intersecting'}}\r\n</div>\r\n",
  "filter-signal/filter-text-demo/filter-text-demo.component.ts": "import { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { filterSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-filter-text-demo',\r\n  standalone: true,\r\n  templateUrl: './filter-text-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class FilterTextDemoComponent {\r\n  readonly maxLengthFilter = filterSignal<string>('', x => x.length < 5);\r\n  readonly onlyLowerCaseFilter = filterSignal('', (x: string): x is Lowercase<string> => !/[A-Z]/.test(x));\r\n\r\n  setFilters(value: string): void {\r\n    this.maxLengthFilter.set(value);\r\n    this.onlyLowerCaseFilter.set(value);\r\n  }\r\n}\r\n",
  "filter-signal/filter-text-demo/filter-text-demo.component.html": "<div class=\"flex flex-row flex-wrap -m-2\">\r\n  <div class=\"m-2\">\r\n    <input class=\"input\" class=\"input input-bordered\" type=\"text\" #textInput\r\n      (keyup)=\"setFilters(textInput.value)\" placeholder=\"Enter some text\" />\r\n  </div>\r\n</div>\r\n<div class=\"flex flex-col sm:flex-row gap-3\">\r\n  <div class=\"flex-grow card card-compact shadow-lg\">\r\n    <div class=\"card-body flex flex-col items-center\">\r\n      <label class=\"label\">Max Length Filter</label>\r\n      <div class=\"h-7 text-lg\">{{maxLengthFilter()}}</div>\r\n    </div>\r\n  </div>\r\n  <div class=\"flex-grow card card-compact  shadow-lg\">\r\n    <div class=\"card-body flex flex-col items-center\">\r\n      <label class=\"label\">Lower case Filter</label>\r\n      <div class=\"h-7 text-lg\">{{onlyLowerCaseFilter()}}</div>\r\n    </div>\r\n  </div>\r\n</div>\r\n",
  "extend-signal/extend-signal-demo/extend-signal-demo.component.ts": "import { CommonModule } from '@angular/common';\r\nimport { ChangeDetectionStrategy, Component } from '@angular/core';\r\nimport { extendSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-extend-signal-demo',\r\n  standalone: true,\r\n  imports: [CommonModule],\r\n  templateUrl: './extend-signal-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class ExtendSignalDemoComponent {\r\n  readonly $voice = extendSignal('hello', {\r\n    clear: (s) => s.set(''),\r\n    whisper: (s, text: string) => s.set(`(${text.toLowerCase()})`),\r\n    yell: (s, text: string) => s.set(`${text.toUpperCase()}!!!`)\r\n  });\r\n}\r\n",
  "extend-signal/extend-signal-demo/extend-signal-demo.component.html": "<div class=\"flex flex-row flex-wrap gap-3\">\r\n  <input class=\"input\" class=\"input input-bordered input-sm shrink grow min-w-10\" type=\"text\" #textInput placeholder=\"Say something\" />\r\n  <div class=\"join\">\r\n    <button type=\"button\" class=\"btn btn-primary btn-sm join-item\" (click)=\"$voice.whisper(textInput.value)\">Whisper</button>\r\n    <button type=\"button\" class=\"btn btn-primary btn-sm join-item\" (click)=\"$voice.yell(textInput.value)\">Yell</button>\r\n    <button type=\"button\" class=\"btn btn-primary btn-sm join-item\" (click)=\"$voice.clear()\">Clear</button>\r\n  </div>\r\n</div>\r\n<div class=\"flex flex-row pt-3\">\r\n  <label class=\"label\">Result</label>\r\n  <div class=\"grow py-2 px-4 border border-base-300 rounded-lg bg-base-100\">{{$voice() || '(no value)'}}</div>\r\n</div>\r\n\r\n",
  "debounce-signal/indirect-demo/indirect-demo.component.ts": "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { debounceSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-indirect-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './indirect-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class IndirectDemoComponent {\r\n  readonly $inputText = signal('')\r\n  readonly $debounceTime = signal(500);\r\n  readonly $debouncedText = debounceSignal(this.$inputText, this.$debounceTime);\r\n}\r\n",
  "debounce-signal/indirect-demo/indirect-demo.component.html": "<div class=\"flex flex-row flex-wrap-reverse gap-3\">\r\n  <div>\r\n    <label class=\"label\">Input Value</label>\r\n    <input class=\"input\" type=\"text\" [ngModel]=\"$inputText()\" (ngModelChange)=\"$inputText.set($event)\" />\r\n  </div>\r\n  <div class=\"w-48\">\r\n    <label class=\"label\">Debounce Time: {{$debounceTime()}}</label>\r\n    <input class=\"range range-primary\" type=\"range\" min=\"0\" max=\"10000\" [ngModel]=\"$debounceTime()\"\r\n      (ngModelChange)=\"$debounceTime.set($event)\" />\r\n  </div>\r\n</div>\r\n<div>\r\n  <div class=\"text-secondary\">Current Value: {{$inputText() || '(no value)'}}</div>\r\n  <div class=\"text-secondary\">Debounced Value: {{$debouncedText() || '(no value)'}}</div>\r\n</div>\r\n",
  "debounce-signal/direct-demo/direct-demo.component.ts": "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\r\nimport { FormsModule } from '@angular/forms';\r\nimport { debounceSignal } from '@ddtmm/angular-signal-generators';\r\n\r\n@Component({\r\n  selector: 'app-direct-demo',\r\n  standalone: true,\r\n  imports: [FormsModule],\r\n  templateUrl: './direct-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class DirectDemoComponent {\r\n  readonly $debounceTime = signal(500);\r\n  readonly $directDebounced = debounceSignal('', this.$debounceTime);\r\n}\r\n",
  "debounce-signal/direct-demo/direct-demo.component.html": "<div class=\"flex flex-row flex-wrap-reverse gap-3\">\r\n  <div>\r\n    <label class=\"label\">Input Value</label>\r\n    <input class=\"input\" type=\"text\" [(ngModel)]=\"$directDebounced\" />\r\n  </div>\r\n  <div class=\"w-48\">\r\n    <label class=\"label\">Debounce Time: {{$debounceTime()}}</label>\r\n    <input class=\"range range-primary\" type=\"range\" min=\"0\" max=\"10000\" [(ngModel)]=\"$debounceTime\" />\r\n  </div>\r\n</div>\r\n<div>\r\n  <div class=\"text-secondary\">Current Value: {{$directDebounced() || '(no value)'}}</div>\r\n</div>\r\n",
  "async-signal/customer-demo/shop.service.ts": "import { Injectable } from '@angular/core';\r\nimport { Observable, timer, map } from 'rxjs';\r\n\r\ninterface Entity {\r\n  id: number;\r\n  name: string;\r\n}\r\n\r\nconst DEMO_DATA = {\r\n  customers: [\r\n    { \"id\": 1, \"name\": \"Danny Gimenez\" },\r\n    { \"id\": 2, \"name\": \"Joe Sanchez\" },\r\n    { \"id\": 3, \"name\": \"Terry Terry\" },\r\n    { \"id\": 4, \"name\": \"Suzan Sales\" }\r\n  ],\r\n  orders: [\r\n    { \"id\": 1, \"customerId\": 1, \"products\": [1, 3] },\r\n    { \"id\": 2, \"customerId\": 2, \"products\": [2, 4] },\r\n    { \"id\": 3, \"customerId\": 3, \"products\": [5, 7] },\r\n    { \"id\": 4, \"customerId\": 4, \"products\": [6, 8] }\r\n  ],\r\n  products: [\r\n    { \"id\": 1, \"name\": \"Car\" },\r\n    { \"id\": 2, \"name\": \"Dog\" },\r\n    { \"id\": 3, \"name\": \"Bunny\" },\r\n    { \"id\": 4, \"name\": \"Video Game\" },\r\n    { \"id\": 5, \"name\": \"Atari\" },\r\n    { \"id\": 6, \"name\": \"Rad Skate Board\" },\r\n    { \"id\": 7, \"name\": \"Scary Terry Doll\" },\r\n    { \"id\": 8, \"name\": \"Globe\" }\r\n  ]\r\n};\r\n\r\n@Injectable({\r\n  providedIn: 'root'\r\n})\r\nexport class ShopService {\r\n  defaultExecutionTime = 2000;\r\n  getCustomers(): Observable<Entity[]> {\r\n    return timer(this.defaultExecutionTime).pipe(map(() => [...DEMO_DATA.customers]));\r\n  }\r\n  getCustomerProducts(customerId: number): Observable<Entity[]> {\r\n    return timer(this.defaultExecutionTime).pipe(\r\n      map(() =>\r\n      DEMO_DATA.orders\r\n          .filter((x) => x.customerId === customerId)\r\n          .flatMap((x) => x.products.map((orderProductId) => DEMO_DATA.products.find((x) => x.id === orderProductId)))\r\n          .filter((x): x is NonNullable<typeof x> => !!x)\r\n      )\r\n    );\r\n  }\r\n\r\n  getProducts(): Observable<Entity[]> {\r\n    return timer(this.defaultExecutionTime).pipe(map(() => [...DEMO_DATA.products]));\r\n  }\r\n}\r\n",
  "async-signal/customer-demo/customer-demo.component.ts": "import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';\r\nimport { toSignal } from '@angular/core/rxjs-interop';\r\nimport { asyncSignal } from '@ddtmm/angular-signal-generators';\r\nimport { of, startWith } from 'rxjs';\r\nimport { ShopService } from './shop.service';\r\n\r\n@Component({\r\n  selector: 'app-customer-demo',\r\n  standalone: true,\r\n  templateUrl: './customer-demo.component.html',\r\n  changeDetection: ChangeDetectionStrategy.OnPush\r\n})\r\nexport class CustomerDemoComponent {\r\n  private readonly shopSvc = inject(ShopService);\r\n  /* Just a regular observable converted to a signal. */\r\n  readonly $customers = toSignal(this.shopSvc.getCustomers().pipe(startWith(undefined)));\r\n  readonly $id = signal(0);\r\n  /** uses $id signal to get customer products */\r\n  readonly $products = asyncSignal(() =>\r\n    this.$id() !== 0 ? this.shopSvc.getCustomerProducts(this.$id()).pipe(startWith(undefined)) : of([]),\r\n    { defaultValue: [] }\r\n  );\r\n}\r\n",
  "async-signal/customer-demo/customer-demo.component.html": "<div class=\"grid grid-flow-row md:grid-flow-col md:grid-cols-2 gap-3\">\r\n  <!-- customers column -->\r\n  <div>\r\n    <div class=\"font-semibold\">Customers</div>\r\n    @if ($id() === 0) {\r\n      <span class=\"text-info\">Click one to simulate loading</span>\r\n    }\r\n    @if (!$customers()) {\r\n      <div>Loading <span class=\"loading loading-spinner loading-sm align-text-bottom text-info\"></span></div>\r\n    }\r\n    @else {\r\n      <table class=\"table\">\r\n        <thead>\r\n          <tr>\r\n            <th>ID</th>\r\n            <th>Name</th>\r\n          </tr>\r\n        </thead>\r\n        <tbody>\r\n          @for (c of $customers(); track c.id) {\r\n            <tr class=\"hover\" (click)=\"$id.set(c.id)\">\r\n              <td>{{ c.id }}</td>\r\n              <td>{{ c.name }}</td>\r\n            </tr>\r\n          }\r\n        </tbody>\r\n      </table>\r\n    }\r\n  </div>\r\n  <!-- products column -->\r\n  <div>\r\n    <div class=\"font-semibold\">Products</div>\r\n    @if ($id() === 0) {\r\n      <span class=\"text-info\">Select Customer to see Products</span>\r\n    }\r\n    @if (!$products()) {\r\n      <div>Loading <span class=\"loading loading-spinner loading-sm align-text-bottom text-info\"></span></div>\r\n    }\r\n    @else if ($products()?.length) {\r\n      <table class=\"table\">\r\n        <thead>\r\n          <tr>\r\n            <th>Product Name</th>\r\n          </tr>\r\n        </thead>\r\n        <tbody>\r\n          @for (p of $products(); track p.id) {\r\n            <tr>\r\n              <td>{{ p.name }}</td>\r\n            </tr>\r\n          }\r\n        </tbody>\r\n      </table>\r\n    }\r\n  </div>\r\n</div>\r\n"
}