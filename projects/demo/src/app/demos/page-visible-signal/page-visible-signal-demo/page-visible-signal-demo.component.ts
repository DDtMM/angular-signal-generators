import { ChangeDetectionStrategy, Component, ElementRef, effect, viewChild } from '@angular/core';
import { pageVisibleSignal } from '@ddtmm/angular-signal-generators';
import { PAGE_VISIBLE_DEMO_AUDIO } from '../shared/page-visible-demo-audio';

@Component({
  selector: 'app-page-visible-signal-demo',
  templateUrl: './page-visible-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageVisibleSignalDemoComponent {
  readonly audioSource = PAGE_VISIBLE_DEMO_AUDIO;
  readonly $pageVisible = pageVisibleSignal();
  readonly $audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  constructor() {
    let resumeWhenVisible = false;

    effect(() => {
      const visible = this.$pageVisible();
      const audio = this.$audio()?.nativeElement;
      if (audio && visible !== undefined) {
        if (!visible) {
          resumeWhenVisible = !audio.paused;
          audio.pause();
        } else if (resumeWhenVisible) {
          audio.play();
        }
      }
    });
  }
}
