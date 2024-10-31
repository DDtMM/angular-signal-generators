import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UsageType } from '../demo-configuration';

interface UsageUiInfo {
  class: string;
  /** aria-description. */
  description: string;
  label: string;
  /** Displayed in tooltip popup */
  tipText: string;
}
const TIP_UI: Record<UsageType, UsageUiInfo> = {
  generator: {
    class: 'bg-blue-300 text-blue-900',
    description: 'Badge indicating this can be passed a signal, observable, or compute function to generate new values.',
    label: 'G',
    tipText: 'This can be passed a signal, observable, or compute function to generate new values.'
  },
  obsolete: {
    class: 'bg-red-300 text-black',
    description: 'Badge indicating this functionality will be removed in a future release.',
    label: 'O',
    tipText: 'This functionality will be removed in a future release.'
  },
  utility: {
    class: 'bg-yellow-300 text-yellow-900',
    description: 'Badge indicating this is a function that does not create a signal but can be used with one.',
    label: 'U',
    tipText: 'A function that does not create a signal but can be used with one.'
  },
  writableSignal: {
    class: 'bg-green-300 text-green-900',
    description: 'Badge indicating this can be passed a value to create an writable signal.',
    label: 'W',
    tipText: 'This can be passed a value to create an writable signal.'
  }
};

@Component({
    selector: 'app-signal-type-badge',
    imports: [CommonModule],
    template: `
<!-- badges didn't look great -->
<div class="rounded-xl text-center w-8 text-sm tooltip z-50 font-semibold " [ngClass]="$uiInfo().class"
  role="status"
  [attr.data-tip]="$uiInfo().tipText"
  [attr.aria-description]="$uiInfo().description">
  {{$uiInfo().label}}
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalTypeBadgeComponent {
  readonly $type = input.required<UsageType>({ alias: 'type' });
  readonly $uiInfo = computed(() => TIP_UI[this.$type()]);
}
