import easingsFunctions from 'easings.net'

/** A function used for updating animations.  Meant for requestAnimationFrame or some substitution. */
export type AnimationFrameFn = (callback: (timeStamp: number) => void) => number;

/** Type of easing names. */
export type EasingName = keyof typeof easingsFunctions;

/** Names of easing functions */
export const EASING_NAMES = Object.keys(easingsFunctions) as EasingName[];

/** Gets an easing function by name */
export function getEasingFn(easingName: EasingName): (x: number) => number {
  return easingsFunctions[easingName];
}

/** Gets a function for requesting animation frames.  Either requestAnimationFrame or a setTimeout approximating 30 fps. */
export function getRequestAnimationFrame(): AnimationFrameFn {
  return window.requestAnimationFrame
    ?? ((callback: (timeStamp: number) => void) => setTimeout(() => callback(Date.now()), 33));
}

