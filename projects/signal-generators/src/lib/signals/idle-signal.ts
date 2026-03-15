import { CreateSignalOptions, InjectionToken, Injector, RendererFactory2, Signal, signal, untracked } from '@angular/core';
import { getDestroyRef, getInjector } from '../internal/utilities';


/** Default events to listen to for activity detection. */
const DEFAULT_IDLE_EVENTS = [ 
    'mousedown',
    'mousemove',
    'mousewheel',
    'keydown',
    'scroll',
    'touchmove',
    'touchstart'
];

/** Default idle timeout in milliseconds. */
const DEFAULT_IDLE_TIMEOUT = 60000;

/** String to identify idle state */
const IDLE_ID = 'idling';


/** Options that can be provided globally with {@link provideIdleSignalGlobalOptions} */
export interface IdleDetectionSettings {
  /**
   * The browser events to listen to for activity detection.
   * @default ['mousedown', 'mousemove', 'mousewheel', 'keydown', 'scroll', 'touchmove', 'touchstart']
   */
  events?: string[];
  /**
   * Time in milliseconds until the user is considered idle.
   * @default 60000
   */
  idleTimeout?: number;
}

/** 
 * Options for {@link idleSignal}. 
 * Defaults can be provided via {@link provideIdleSignalGlobalOptions}.
 */
export interface IdleSignalOptions extends IdleDetectionSettings, Pick<CreateSignalOptions<IdleState>, 'debugName'> {
  /** Pass injector if this is not created in Injection Context. */
  injector?: Injector;
}

/** The state of the idle detection. */
export interface IdleState {
  /** The reason for the last state change (e.g., 'idleTimeout', 'mousemove', 'keydown'). */
  changeReason:  typeof IDLE_ID | string;
  /** Whether the user is currently idle. */
  isIdle: boolean;
  /** Time in milliseconds since the last state change. */
  timeSinceLastChange: number;
}

/**
 * Creates a signal that detects user idle state by monitoring browser events.
 *
 * The signal returns an object containing:
 * - `isIdle`: Whether the user is currently idle
 * - `timeSinceLastChange`: Time in milliseconds since the last state change
 * - `changeReason`: The reason for the last change ('idling', 'active', or event name)
 *
 * The signal automatically cleans up listeners when destroyed.
 *
 * @param options Configuration options for idle detection
 * @returns A readonly signal containing the idle state
 *
 * @example
 * ```ts
 * const $idle = idleSignal({ idleTimeout: 30000 });
 *
 * effect(() => {
 *   const state = $idle();
 *   console.log(`Idle: ${state.isIdle}, Time: ${state.timeSinceLastChange}ms, Reason: ${state.changeReason}`);
 * });
 * ```
 *
 * @example
 * ```ts
 * // Custom events and timeout
 * const $idle = idleSignal({
 *   events: ['mousedown', 'keydown'],
 *   idleTimeout: 120000
 * });
 * ```
 */
export function idleSignal(options?: IdleSignalOptions): Signal<IdleState> {
  const injector = options?.injector ?? getInjector(idleSignal);
  const globalOptions = injector.get(IdleSignalGlobalOptions);
  const events = options?.events ?? globalOptions.events ?? DEFAULT_IDLE_EVENTS;
  const idleTimeout = options?.idleTimeout ?? globalOptions.idleTimeout ?? DEFAULT_IDLE_TIMEOUT;
  const renderer = injector.get(RendererFactory2).createRenderer(null, null);

  const $output = signal<IdleState>({
    changeReason: 'initialized',
    isIdle: false,
    timeSinceLastChange: 0
  }, options);
  
  const eventListeners: (() => void)[] = [];
  let idleTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastChangeTime = Date.now();
  

  // Add event listeners using Renderer2
  events.forEach(eventName => {
    const destroyFn = renderer.listen('window', eventName, handleInterrupt);
    eventListeners.push(destroyFn);
  });

  // Start the idle timer
  resetIdleTimer();

  // Setup cleanup
  getDestroyRef(idleSignal, injector).onDestroy(cleanup);

  return $output.asReadonly();

  /** Cleans up idle signal resources */
  function cleanup(): void {
    eventListeners.forEach(removeListener => removeListener());
    eventListeners.length = 0;
    stopIdleTimer();
    renderer.destroy();
  }

  // Update state and reset the timer
  function updateState(isIdle: boolean, changeReason: string): void {
    const timeSinceLastChange = Date.now() - lastChangeTime;
    lastChangeTime = Date.now();
    $output.set({
      changeReason,
      isIdle,
      timeSinceLastChange
    });
  }

  /** Handles an activity that restarts the timer, updating the state if it is idle. */
  function handleInterrupt(event: Event): void {
    if (untracked($output).isIdle) {
      updateState(false, event.type);
    }
    resetIdleTimer();
  }

  
  /** Starts or restarts the idle timer to report when idling has occurred. */
  function resetIdleTimer(): void {
    stopIdleTimer();
    idleTimeoutId = setTimeout(() => updateState(true, IDLE_ID), idleTimeout);
  }

  /** Stops the idle timer if it is running. */
  function stopIdleTimer(): void {
    if (idleTimeoutId !== undefined) {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = undefined;
    }
  }

}

const IdleSignalGlobalOptions = new InjectionToken<IdleDetectionSettings>('IdleSignalGlobalOptions', {
  providedIn: 'root',
  factory: () => ({
    events: DEFAULT_IDLE_EVENTS,
    idleTimeout: DEFAULT_IDLE_TIMEOUT
  })
});
/** provides global options for IdleSignal */
export function provideIdleSignalGlobalOptions(options: IdleDetectionSettings) {
  return {
    provide: IdleSignalGlobalOptions,
    useValue: options
  };
}