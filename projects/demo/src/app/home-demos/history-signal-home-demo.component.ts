import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { historySignal } from '@ddtmm/angular-signal-generators';
import { ContentsClassDirective } from '../controls/contents-class.directive';
import { HomeBoxComponent } from '../controls/home-box.component';

@Component({
  imports: [FormsModule, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
  <app-home-box fnName="historySignal">
    <div>Creates a writable signal with undo and redo history.</div>
    <div class="divider">Example</div>
    <input class="input input-bordered input-sm w-full" [ngModel]="$text()" (ngModelChange)="$text.set($event)" />
    <div class="flex gap-2 mt-3">
      <button class="btn btn-sm" [disabled]="!$text.canUndo()" (click)="$text.undo()">Undo</button>
      <button class="btn btn-sm" [disabled]="!$text.canRedo()" (click)="$text.redo()">Redo</button>
    </div>
  </app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorySignalHomeDemoComponent {
  readonly $text = historySignal('Edit me');
}
