# Angular Signal Generators

Angular Signal Generators are purpose built signals meant to simplify common tasks encountered in Components.

## Generators

### debounceSignal

This is very similar to rxjs's *debounce* operator.  This has two overloads - one where it accepts a signal and the value is debounced in a readonly signal, and one where it has a *set* and *update* method and the change of the value occurs after debounce time elapses.

```ts
const userInput = signal('original');
const debouncedInput = debounceSignal(userInput, 1000);

userInput.set('updated');
setTimeout(() => console.log(`${userInput()}, ${debouncedInput}`), 500); // updated, original
setTimeout(() => console.log(`${userInput()}, ${debouncedInput}`), 1000); // updated, updated

const directDebounce = debounceSignal('original', 1000);
directDebounce.set('updated');
setTimeout(() => console.log(directDebounce(), 500); // original
setTimeout(() => console.log(directDebounce(), 1000); // updated

const debounceTime = signal(1000);
const variableDebounce = debounceSignal('original', debounceTime);
variableDebounce.set('updated');
setTimeout(() => debounceTime.set(2000), 500);
setTimeout(() => console.log(directDebounce(), 1000); // original
setTimeout(() => console.log(directDebounce(), 1000); // updated
```

#### Methods (if second overload is used)
* **mutate(mutator)** - Starts the debounce timer and will update the value when the mutator completes.
* **set(value)** - Starts the debounce timer and will update the value when the timer completes.

### timerSignal

This is very similar to rxjs's *timer* operator.  It will be have like setTimeout or interval depending on the parameters passed.  The value of the timer is incremented after every "tick".

```ts
// a simple counter:
const secondCounter = timer(1000, 1000);
const message = computed(() => `Time elapsed: ${secondCounter()}`);
effect(() => console.log(message()));

// do something after an amount of time:
const explosionTime = signal(10000);
const explode = timer(explosionTime());
const explosionHandler = effect(() => {
  if (explode() === 1) {
    console.log('BOOM!');
    secondCounter.pause();
  }
});

// add an extra second before explosion.
setTimeout(() => explosionTime.set(1000));
```

#### Methods
* **pause()** - Pauses the timer.
* **resume()** - Resume after pause.  Does nothing otherwise.
* **restart()** - Restarts the timer from 0.

## Conventions

### SignalInput and ValueSource
Every method accepts either a **SignalInput&lt;T&gt;** or **ValueSource&lt;T&gt;**.

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

### Injector
All signal generators have an options parameter that accept injector.  This is either because *effect* is needed sometimes or if you *toSignal* is used.


## Issues or Ideas?
Please add an issue if you have a problem.
