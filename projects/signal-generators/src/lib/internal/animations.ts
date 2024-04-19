/** A function used for updating animations.  Meant for requestAnimationFrame or some substitution. */
export type AnimationFrameFn = (callback: (timeStamp: number) => void) => unknown;

/** Gets a function for requesting animation frames.  Either requestAnimationFrame or a setTimeout approximating 30 fps. */
export function getRequestAnimationFrame(): AnimationFrameFn {
  return (!globalThis.requestAnimationFrame)
    ? ((callback: (timeStamp: number) => void) => setTimeout(() => callback(Date.now()), 33))
    : globalThis.requestAnimationFrame;
}

