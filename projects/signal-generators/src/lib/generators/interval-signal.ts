import { SignalInput } from '../internal/signal-coercion';
import { TimerSignal, TimerSignalOptions, timerSignal } from './timer-signal';

/**
 * Creates a signal that emits a progressively increasing number at the interval of dueTime.
 *
 * Basically this is just an alias to {@link timerSignal} without the two parameters.
*/
export function intervalSignal(dueTime: number | SignalInput<number>, options?: TimerSignalOptions): TimerSignal {
  return timerSignal(dueTime, dueTime, options);
}
