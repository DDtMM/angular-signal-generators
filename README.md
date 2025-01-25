# Angular Signal Generators 

 Streamline your Angular development with Angular Signal Generators,
a library of signals and utilities designed to replace common patterns for faster, cleaner code.

Check out the **[demos](https://ddtmm.github.io/angular-signal-generators/)** to learn more.

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Installation

```
npm install @ddtmm/angular-signal-generators
```

## Usage
You can import the signals and utilities from `@ddtmm/angular-signal-generators`.  Like regular signals, the library's signals are used just like ordinary functions. 

```ts
import { debounceSignal, liftSignal, timerSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-signal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>{{$secondsSinceStart()}}</div>
<div>
  <input type="text" [(ngModel)]="$debounced" />
  {{debounced()}}
</div>
<div>
  <button type="button" (click)="$liftedArray.push(secondsSinceStart())">
    Add Element
  </button> 
  {{$liftedArray() | json}}
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalDemoComponent {
  readonly $debounced = debounceSignal('type in me', 1000);
  readonly $liftedArray = liftSignal([0], null, ['push']);
  readonly $secondsSinceStart = timerSignal(1000, 1000);
}
```

## Signals

### Animation Signals - springSignal / tweenSignal

These are directly inspired by Svelte's *spring* and *tweened* functions.  When the signal value changes, the observed value slowly morphs over time.  So if the original value was **1** and the next value was set to **5**, then the observed value will be something like *1*, *1.512*, *2.12*, *2.6553*, *3* over a set duration.

### asyncSignal

Takes an async source (Promise, Observable) or signal/function that returns an async source and returns that source's values as part of a signal.  Kind of like an rxjs flattening operator.

### debounceSignal

This is very similar to rxjs's *debounce* operator.  This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal, and one where it has a *set* and *update* method and the change of the value occurs after debounce time elapses.

### DOM Observer Signals - intersectionSignal / mutationSignal / resizeSignal

These signals wrap the DOM observers IntersectionObserver, MutationObserver and ResizeObserver to output the last observation of changes to a target element passed to the signal.

### eventSignal

Listens to HTML element events via Renderer2 and map them to new values.  
Since a signal can be passed it is easy to use with viewChild function.

### filterSignal

Filters values set to a signal to prevent the value from changing:  
If the filter assigned at creation does not pass then the signal does not change. 
Can be used with guard functions.

### liftSignal

"Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.  The lifted methods should be those appropriate for mutating or updating the value.  For example, lifting `Array.push` will add a method called *push* to the signal.  Calling the *push* method will internally call `signal.mutate()` with a function that executes the push.

### mapSignal

Creates a signal whose input value is immediately mapped to a different value based on a selector.
Either a value or multiple signals can be passed and used in the selector function.

### mediaQuerySignal

Takes a media query, and updates its value whenever the state of that query being matched changes.

### nestSignal

Creates a signal whose value changes after any nested signal's value updates no matter how deep the signal is nested.
It's value will be an object where every signal is replaced with its emitted value.

### reduceSignal

Creates a signal similar to `Array.reduce` or Rxjs's `scan` operator, using a reducer function to create a new value from the current and prior values.

### sequenceSignal

The Sequence Signal is useful for situations where you want to easily cycle between options.  For example, if you want to toggle between true/false or a list of sizes.  These are still writable signals so you can manually override the current value.

There is also a special option to pass a cursor, which is similar to an iterator, but can be reset.  There will probably be more functionality added later.

### Storage Signals - storageSignal / localStorageSignal / sessionStorageSignal

Signals that uses a secondary storage system to store values, ideally beyond the lifetime of the application.  The next time the signal is initialized the initial value will come from this secondary storage.  Implementations using *localStorage* and *sessionStorage* exist for your convenience.

### timerSignal

This is very similar to rxjs's *timer* operator.  It will be have like setTimeout or interval depending on the parameters passed.  The value of the timer is incremented after every "tick".

## Utilities

### gatedEffect

An effect with options to control when it start, stops or runs.

### inspect

Inspired by Svelte's $inspect rune, logs the resolved values of signals deeply nested in an object, array or signal.

### signalToIterator

Converts a signal to an AsyncIterator.  Once created, changes are retained until elements are looped through at a later time.

## Conventions

### ReactiveSource and ValueSource
As much as possible signals the functions provided try to create signals from either values or other signals.
To accommodate this, many arguments are of type **ReactiveSource&lt;T&gt;** or **ValueSource&lt;T&gt;**.

*ReactiveSource* can be either something that can be either converted to a signal with *toSignal*, a function that can be passed to *computed* or a regular old *signal*.  The purpose of this is to make things just a bit more convenient.

### ValueSource
A *ValueSource* is a *ReactiveSource* ***or a value***.  The limiting factor here is that if you wanted to use a *SignalSource* as a value, then you'd have to wrap that in a *signal*.

```ts
const timerFromValue = timerSignal(1000);

const timeSourceAsSignal = signal(1000);
const timerFromSignal = timer(timeSourceAsSignal);

const timerFromComputedFn = timer(() => timeSourceAsSignal() * 2);

const timerSource$ = new BehaviorSubject(1000);
const timerFromObservable = timer(timerSource$);
```
### Overloads
Several generators that accept a traditional value and a *ReactiveSource* will have different return types.  Those that accept a *ReactiveSource* will return a read only signal, whereas those with a traditional value will have methods to update the signal, though not necessarily the same as a *WritableSignal*.

### Injector
All signal generators have an options parameter that accept injector.  This is either because *effect* is needed sometimes or it passed
along if an observable is converted to an signal.


## Issues or Ideas?
I'm just adding signals as I run into real life problems.  Please add an issue if you have an idea or run into a technical difficulty.
