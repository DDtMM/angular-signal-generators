import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { InterpolationDemoComponent } from './interpolation-demo/interpolation-demo.component';
import { MultipleNumbersDemoComponent } from './multiple-numbers-demo/multiple-numbers-demo.component';
import { SimpleDemoComponent } from './simple-demo/simple-demo.component';


@Component({
  selector: 'app-tween-signal-page',
  standalone: true,
  imports: [
    CommonModule,
    DemoHostComponent,
    FormsModule,
    HighlightModule,
    SignalHeaderComponent,
    InterpolationDemoComponent,
    MultipleNumbersDemoComponent,
    SimpleDemoComponent
  ],
  template: `
<!-- for some reason the API docs come out with -1 at the end -->
<app-signal-header fnName="tweenSignal" />
<p>
  This function is heavily inspired by Svelte's <i>tweened</i> function.
  It allows you to create engaging simple transition animations with just a signal.
  By default this can automatically tween between a number, array of numbers, or Record of numbers.
  You can also pass an interpolation function to tween between objects of any type.
</p>
<p>
  As a convenience a collection of easing functions are provided such as <i>easeInBack</i>.
  They can also be retrieved as a collection of all easing functions by importing <i>easings</i>.
</p>
<div class="flex flex-col gap-3">
  <app-demo-host name="Simple Value Changes" pattern="tween-signal/simple-demo">
    <app-simple-demo />
  </app-demo-host>
  <app-demo-host name="Multiple Value Changes" pattern="tween-signal/multiple-numbers-demo/">
    <app-multiple-numbers-demo />
  </app-demo-host>
  <app-demo-host name="Fun with Interpolation" pattern="tween-signal/interpolation-demo/">
    <app-interpolation-demo />
  </app-demo-host>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TweenSignalPageComponent {}
