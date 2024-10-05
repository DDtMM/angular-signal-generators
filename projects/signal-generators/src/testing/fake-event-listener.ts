// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventListenerFn = EventListenerOrEventListenerObject | ((evt: any) => unknown);

/** This class can be part of a testing double that needs to simulate an event listener */
export class FakeEventListener<TEvtKey extends string, TEvtMap extends Record<TEvtKey, Event>> {
  readonly listeners: { [K: string]: Set<(evt: typeof K extends TEvtKey ? TEvtMap[typeof K] : Event) => unknown> } = {};

  addEventListener<K extends TEvtKey>(
    type: K,
    listener: (ev: TEvtMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerFn): void {
    this.getOrCreateTypeSet(type).add(this.getListenerFn(listener));
  }

  /** Gets or creates a set of listeners for a type. */
  getOrCreateTypeSet(type: TEvtKey): Set<(event: TEvtMap[typeof type]) => undefined>;
  getOrCreateTypeSet(type: string): Set<EventListenerFn>;
  getOrCreateTypeSet(type: string): Set<EventListenerFn> {
    return this.listeners[type] ?? (this.listeners[type] = new Set());
  }

  removeEventListener<K extends TEvtKey>(
    type: K,
    listener: (ev: TEvtMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerFn): void {
    this.getOrCreateTypeSet(type).delete(this.getListenerFn(listener));
  }

  protected getListenerFn(listener: EventListenerFn) {
    return 'handleEvent' in listener ? listener.handleEvent : listener;
  }
}
