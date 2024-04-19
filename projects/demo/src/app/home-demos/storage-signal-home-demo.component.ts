import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { localStorageSignal } from 'projects/signal-generators/src/public-api';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  standalone: true,
  imports: [FormsModule, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
    <app-home-box fnName="storageSignal">
      <div>
        A signal that uses a secondary store to persist values beyond an application's lifetime.
        with built-in <i>localStorageSignal</i> and <i>sessionStorageSignal</i> implementations.
      </div>
      <div class="divider">Example</div>
      <div class="flex flex-row gap-3 items-baseline">
        <label>Input</label>
        <input type="text" class="input input-bordered input-sm grow" [ngModel]="$storageValue()" (ngModelChange)="$storageValue.set($event)" />
      </div>
      <div class="italic">Refresh page to see value persist</div>
    </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageSignalHomeDemoComponent {
  $storageValue = localStorageSignal('', '_storage_signal_demo');
}
