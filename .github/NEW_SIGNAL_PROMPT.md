# New Signal Generation Prompt

Please follow the instructions below to create a new signal, its tests, and the corresponding demo pages.

### 1. Signal Implementation
Create a new file `projects/signal-generators/src/lib/signals/[signal-name]-signal.ts`.
*   **Conventions**:
    *   Use `createSignal` from `@angular/core/primitives/signals` or `signal` + `effect` depending on whether it's a writable or computed signal.
    *   The signal should at least have the debugName option from CreateSignalOptions, if more options are needed define an interface `[SignalName]SignalOptions`.
    *   If the signal needs to be run in the injector context the injector should also be passed as an option.
    *   If the signal has overloads (e.g., creating from a value vs. creating from another signal), ensure all overloads are typed correctly.
    *   Use internal utilities like `coerceSignal`, `isReactive`, `TimerInternal`, etc., from `../internal/` if needed.
    *   Include JSDoc comments with usage examples.
    *   Export the function and any relevant interfaces.
    *   Never assume any browser APIs are available.
    
### 2. Unit Tests
Create a new file `projects/signal-generators/src/lib/signals/[signal-name]-signal.spec.ts`.
*   **Conventions**:
    *   Use `TestBed`, `fakeAsync`, and `tick` from `@angular/core/testing`.
    *   Import and use test helpers from `../../testing/common-signal-tests` (e.g., `runComputedAndEffectTests`, `runDebugNameOptionTest`, `runInjectorOptionTest`).
    *   Use `tickAndAssertValues` from `../../testing/testing-utilities` for testing values over time.
    *   Cover all overloads and edge cases.

### 3. Demo Components and Page
Create demo components in subdirectories under `projects/demo/src/app/demos/[signal-name]-signal/`.
*   **Demo Components**:
    *   Create one or more demo components in subdirectories (e.g., `projects/demo/src/app/demos/[signal-name]-signal/[demo-name]/[demo-name].component.ts`).
    *   Use `Standalone` components.
    *   Use `ChangeDetectionStrategy.OnPush`.
    *   Import `FormsModule` for two-way binding if needed.
    *   Use Tailwind CSS for styling (e.g., `flex`, `gap-3`, `input`, `btn`, `card`).
    *   Provide controls to manipulate the signal's inputs and display the output clearly.

*   **Page Component**:
    *   Create a page component at `projects/demo/src/app/content/signal-factories/[signal-name]-page.component.ts`.
    *   Import and use `MemberPageHeaderComponent`, `DemoHostComponent`.
    *   Include descriptive text explaining the signal's purpose and usage.
    *   Import and display your demo component(s) using `<app-demo-host>` wrapper.

### 4. Home Page Demo
Create a new file `projects/demo/src/app/home-demos/[signal-name]-signal-home-demo.component.ts`.
*   **Structure**:
    *   Create a small, self-contained component.
    *   Use `HomeBoxComponent` as the wrapper.
    *   Use `ContentsClassDirective` on the host.
    *   Provide a brief description of what the signal does inside the `app-home-box`.
    *   Include a minimal interactive example.

### 5. Registration
Provide the code snippet to register the new demo in `projects/demo/src/app/demo-configuration.ts`.
*   Add a new `DemoConfigurationItem` to the `DEMO_CONFIGURATIONS` array.
*   Ensure `fnName`, `route`, `docUrl`, and `sourceUrl` are correctly formatted.
*   The `docUrl` should follow the pattern: `${DOC_URL_PREFIX}[functionName].html`
*   The `sourceUrl` should be the relative path from the lib folder (e.g., `signals/[signal-name]-signal.ts`)
*   Lazy load the page component using dynamic import: `page: () => import('./content/signal-factories/[signal-name]-page.component').then(x => x.[SignalName]PageComponent)`
*   Set appropriate `usages` array (e.g., `['generator']`, `['generator', 'writableSignal']`, `['utility']`)

