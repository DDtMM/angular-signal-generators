import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HighlightModule } from 'ngx-highlightjs';
import { debounceSignal, filterSignal, mapSignal, sequenceSignal, timerSignal, tweenSignal } from 'projects/signal-generators/src/public-api';
import { ExampleCodeComponent } from './controls/example-code.component';
import { SignalTypeBadgeComponent } from './controls/signal-type-badge.component';
import { HomeBoxComponent } from './controls/home-box.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ExampleCodeComponent, FormsModule, HighlightModule, HomeBoxComponent, RouterLink, SignalTypeBadgeComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly debounced = debounceSignal('', 500);
  readonly filtered = filterSignal<string>('no upper case letters please', (x) => !/[A-Z]/.test(x));
  readonly mapSource = signal(1);
  readonly mapDoubled = mapSignal(this.mapSource, x => x * 2);
  readonly sequenceChoices = sequenceSignal(['a', 'b', 'c']);
  readonly timerExample = timerSignal(1000, 1000);
  readonly tweenExample = tweenSignal(0, { duration: 1000, easing: 'easeInBounce' });
}
