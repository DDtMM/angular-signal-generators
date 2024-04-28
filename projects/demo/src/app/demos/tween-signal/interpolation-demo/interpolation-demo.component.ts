import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { InterpolateStepFn, sequenceSignal, tweenSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-interpolation-demo',
  standalone: true,
  templateUrl: './interpolation-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterpolationDemoComponent {
  readonly $stringInterpolationSequence = sequenceSignal([
    'Press the button to see lame typing effect.',
    'I should put something funny here!',
    'Does anybody know what a typewriter is?'
  ]);
  readonly $stringInterpolationTween = tweenSignal(this.$stringInterpolationSequence, {
    duration: 2000,
    interpolator: stringInterpolationFactory
  });
  /** This is here as a workaround for an issue with tweenSignal that appears to only occur in StackBlitz. */
  private readonly _ = effect(() => console.log(this.$stringInterpolationTween()));
}

/** Weights the interpolation so the second half takes longer than the first. */
function stringInterpolationFactory(a: string, b: string): InterpolateStepFn<string> {
  const midPoint = (a.length / Math.max(1, a.length + b.length)) * 0.25;

  return (progress: number): string => {
    switch (progress) {
      case 0:
        return a;
      case 1:
        return b;
      default:
        const aProgress = midPoint !== 0 ? Math.min(1, progress / midPoint) : 1;
        const bProgress = midPoint !== 1 ? Math.max(0, (progress - midPoint) / (1 - midPoint)) : 1;
        return a.slice(0, Math.floor((1 - aProgress) * a.length)) + b.slice(0, Math.floor(bProgress * b.length));
    }
  };
}
