import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpringOptions } from '@ddtmm/angular-signal-generators';


@Component({
  selector: 'app-spring-options',
  imports: [CommonModule, FormsModule],
  template: `
<div class="grid grid-cols-[auto,auto,auto] md:grid-cols-[auto,auto,auto,auto,auto,auto] gap-3">
  <div class="grid grid-cols-subgrid gap-3 col-span-3 bg-base-200 p-3 rounded">
    <label for="dampingRange">Damping</label>
    <input id="dampingRange" type="range" min="0.1" max="20" class="range range-primary" step="0.01" 
      [ngModel]="$springOptions().damping" (ngModelChange)="patchOptions({ damping: $event })" />
    <span aria-label="Damping %"> {{ ($springOptions().damping || 0) | number: '1.1-1' }} </span>
  </div>
  <div class="grid grid-cols-subgrid gap-3 col-span-3 bg-base-200 p-3 rounded">
    <label for="stiffnessRange">Stiffness</label>
    <input id="stiffnessRange" type="range" min="0.1" max="200" class="range range-primary" step="0.01"
      [ngModel]="$springOptions().stiffness" (ngModelChange)="patchOptions({ stiffness: $event })" /> 
    <span aria-label="Stiffness %"> {{ ($springOptions().stiffness || 0) | number: '1.1-1' }} </span>
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpringOptionsComponent {
  readonly $springOptions = model.required<Partial<SpringOptions>>(
    { alias: 'springOptions' }
  );

  patchOptions(partialOptions: Partial<SpringOptions>): void {
    this.$springOptions.update((x) => ({ ...x, ...partialOptions }));
  }
}
