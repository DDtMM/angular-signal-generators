import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { extendSignal } from 'projects/signal-generators/src/public-api';

@Component({
  selector: 'app-extend-signal-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extend-signal-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendSignalDemoComponent {
  readonly $voice = extendSignal('hello', {
    clear: (s) => s.set(''),
    whisper: (s, text: string) => s.set(`(${text.toLowerCase()})`),
    yell: (s, text: string) => s.set(`${text.toUpperCase()}!!!`)
  });
}
