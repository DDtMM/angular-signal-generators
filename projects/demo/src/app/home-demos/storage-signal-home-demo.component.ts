import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { localStorageSignal } from '@ddtmm/angular-signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
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
        <label for="storageSignalHomeDemoInput">Input</label>
        <input id="storageSignalHomeDemoInput" type="text" class="input input-bordered input-sm grow" [(ngModel)]="$storageValue" />
      </div>
      <div class="italic">Refresh page to see value persist</div>
    </app-home-box>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageSignalHomeDemoComponent {
  readonly $storageValue = localStorageSignal('', '_storage_signal_demo');
}
