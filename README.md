# Angular Signal Generators

Angular Signal Generators are purpose built signals meant to simplify common tasks encountered in Components.
Check out the [demos](https://ddtmm.github.io/angular-signal-generators/) for a better idea on how they can be used.

## Installation

```
npm install @ddtmm/angular-signal-generators
```

You can import the signals from `'@ddtmm/angular-signal-generators`.

```ts
import { debounceSignal, sequenceSignal, timerSignal } from '@ddtmm/angular-signal-generators';
```

## Generators

### debounceSignal

This is very similar to rxjs's *debounce* operator.  This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal, and one where it has a *set* and *update* method and the change of the value occurs after debounce time elapses.

```ts
const userInput = signal('original');
const debouncedInput = debounceSignal(userInput, 1000);

userInput.set('updated');
setTimeout(() => console.log(`${userInput()}, ${debouncedInput}`), 500); // updated, original
setTimeout(() => console.log(`${userInput()}, ${debouncedInput}`), 1000); // updated, updated

// create a signal that is debounced every time it is set.
const directDebounce = debounceSignal('original', 1000);
directDebounce.set('updated');
setTimeout(() => console.log(directDebounce(), 500); // original
setTimeout(() => console.log(directDebounce(), 1000); // updated

// allow debounce time to be changed by another signal.
const debounceTime = signal(1000);
const variableDebounce = debounceSignal('original', debounceTime);
variableDebounce.set('updated');
setTimeout(() => debounceTime.set(2000), 500);
setTimeout(() => console.log(variableDebounce(), 1000); // original
setTimeout(() => console.log(variableDebounce(), 1000); // updated
```

### mapSignal

Creates a signal whose input value is immediately mapped to a different value based on a selector.
Either a value or multiple signals can be passed and used in the selector function.

```ts
const addOne = mapSignal(1, x => x + 1);
console.log(addOne()); // 2

const addOnePlusOne = mapSignal(1, x => x + addOne());
addOne.set(2);
console.log(addOnePlusOne()); // 4

const okayThen = mapSignal(addOne, addOnePlusOne, ([a, b]) => `${a} + ${b} = ${a + b}`);
console.log(okayThen()); 3 + 4 = 7
```
### sequenceSignal

The Sequence Signal is useful for situations where you want to easily cycle between options.  For example, if you want to toggle between true/false or a list of sizes.  These are still writable signals so you can manually override the current value.

There is also a special option to pass a cursor, which is similar to an iterator, but can be reset.  There will probably be more functionality added later.

 ```ts
 const boolSeq = sequenceSignal([true, false]);
 console.log(boolSeq()); // true
 boolSeq.next();
 console.log(boolSeq()); // false
 boolSeq.next();
 console.log(boolSeq()); // true

const fibonacci = sequenceSignal((() => { // closure just for example
let values = [1, 2];
return {
  next: (relativeChange: number) => {
    // there's probably a smarter way to do this.
    for (let i = 0; i < relativeChange; i++) {
      values = [values[1], values[0] + values[1]];
    }
    for (let i = relativeChange; i < 0; i++) {
      values = [Math.max(1, values[1] - values[0]), Math.max(values[0], 2)];
    }
    return { hasValue: true, value: values[0] };
  },
  reset: () => values = [1, 2]
};
})());
console.log(fibonacci()); // 1
fibonacci.next(3);
console.log(fibonacci()); // 5
fibonacci.next(-1);
console.log(fibonacci()); // 3
```

### timerSignal

This is very similar to rxjs's *timer* operator.  It will be have like setTimeout or interval depending on the parameters passed.  The value of the timer is incremented after every "tick".

```ts
// a simple counter:
const secondCounter = timerSignal(1000, 1000);
const message = computed(() => `Time elapsed: ${secondCounter()}`);
effect(() => console.log(message()));

// do something after an amount of time:
const explosionTime = signal(10000);
const explode = timerSignal(explosionTime());
const explosionHandler = effect(() => {
  if (explode() === 1) {
    console.log('BOOM!');
    secondCounter.pause();
  }
});

// add an extra second before explosion.
setTimeout(() => explosionTime.set(1000));
```

## Conventions

### SignalInput and ValueSource
Many arguments are of type **SignalInput&lt;T&gt;** or **ValueSource&lt;T&gt;**.

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
