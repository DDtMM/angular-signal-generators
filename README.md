# <img src="https://raw.githubusercontent.com/DDtMM/angular-signal-generators/main/projects/demo/src/assets/angular-signal-generators-logo.png" alt="Angular Signal Generators Logo" width="32" height="32" style="width: 32px; height: 32px" /> Angular Signal Generators

Angular Signal Generators are purpose built signals meant to simplify common tasks encountered in Components.
Check out the [demos](https://ddtmm.github.io/angular-signal-generators/) for a better idea on how they can be used.

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Installation

```
npm install @ddtmm/angular-signal-generators
```

## Usage
You can import the signals from `'@ddtmm/angular-signal-generators`.  The signals are used just like ordinary functions. 

```ts
import { debounceSignal, liftSignal, timerSignal } from '@ddtmm/angular-signal-generators';

@Component({
  selector: 'app-signal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>{{secondsSinceStart()}}</div>
<div>
  <input type="text" [ngModel]="debounced()" (ngModelChange)="debounced.set($event)" />
  {{debounced()}}
</div>
<div>
  <button type="button" (click)="liftedArray.push(secondsSinceStart())">
    Add Element
  </button> 
  {{liftedArray() | json}}
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalDemoComponent {
  readonly debounced = debounceSignal('type in me', 1000);
  readonly liftedArray = liftSignal([0], null, ['push']);
  readonly secondsSinceStart = timerSignal(1000, 1000);
}
```

## Signals
### asyncSignal

Takes an async source (Promise, Observable) or signal/function that returns an async source and returns that source's values as part of a signal.  Kind of like an rxjs flattening operator.

### debounceSignal

This is very similar to rxjs's *debounce* operator.  This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal, and one where it has a *set* and *update* method and the change of the value occurs after debounce time elapses.

### extendSignal

Adds new methods to a signal - even hiding the existing methods if desired.  It does this by passing the original signal or a "proxy" as the first parameter of the new method.  This first parameter is obscured from the consumer so that it appears to be a normal method.

### filterSignal

Filters values set to a signal to prevent the value from changing:  
If the filter assigned at creation does not pass then the signal does not change. 
Can be used with guard functions.

### liftSignal

"Lifts" methods from a signal's value to the signal itself just by passing a tuple of method names.  The lifted methods should be those appropriate for mutating or updating the value.  For example, lifting `Array.push` will add a method called *push* to the signal.  Calling the *push* method will internally call `signal.mutate()` with a function that executes the push.

### mapSignal

Creates a signal whose input value is immediately mapped to a different value based on a selector.
Either a value or multiple signals can be passed and used in the selector function.

### reduceSignal
Creates a signal similar to `Array.reduce` or Rxjs's `scan` operator, using a reducer function to create a new value from the current and prior values.

### sequenceSignal

The Sequence Signal is useful for situations where you want to easily cycle between options.  For example, if you want to toggle between true/false or a list of sizes.  These are still writable signals so you can manually override the current value.

There is also a special option to pass a cursor, which is similar to an iterator, but can be reset.  There will probably be more functionality added later.

### timerSignal

This is very similar to rxjs's *timer* operator.  It will be have like setTimeout or interval depending on the parameters passed.  The value of the timer is incremented after every "tick".

### tweenSignal

This was directly inspired by Svelte's *tweened* function.  When the signal value is change, the observed value slowly morphs over time.  So if the original value was **1** and the next value was set to **5**, then the observed value will be something like *1*, *1.512*, *2.12*, *2.6553*, *3* over a set duration.

## Utilities

### signalToIterator

Converts a signal to an AsyncIterator.  Once created, changes are retained until elements are looped through at a later time.

## Conventions

### SignalInput and ValueSource
As much as possible signals the functions provided try to create signals from either values or other signals.
To accommodate this, many arguments are of type **SignalInput&lt;T&gt;** or **ValueSource&lt;T&gt;**.

*SignalInput* can be either something that can be either converted to a signal with *toSignal*, a function that can be passed to *computed* or a regular old *signal*.  The purpose of this is to make things just a bit more convenient.

### ValueSource
A *ValueSource* is a *SignalSource* ***or a value***.  The limiting factor here is that if you wanted to use a *SignalSource* as a value, then you'd have to wrap that in a *signal*.

```ts
const timerFromValue = timerSignal(1000);

const timeSourceAsSignal = signal(1000);
const timerFromSignal = timer(timeSourceAsSignal);

const timerFromComputedFn = timer(() => timeSourceAsSignal() * 2);

const timerSource$ = new BehaviorSubject(1000);
const timerFromObservable = timer(timerSource$);
```
### Overloads
Several generators that accept a traditional value and a *SignalInput* will have different return types.  Those that accept a *SignalInput* will return a read only signal, whereas those with a traditional value will have methods to update the signal, though not necessarily the same as a *WritableSignal*.

### Injector
All signal generators have an options parameter that accept injector.  This is either because *effect* is needed sometimes or if you *toSignal* is used.


## Issues or Ideas?
I'm just adding signals as I run into real life problems.  Please add an issue if you have an idea or run into a technical difficulty.
