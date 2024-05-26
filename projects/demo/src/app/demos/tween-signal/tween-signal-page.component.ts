import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
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
    DemoPageHeaderComponent,
    InterpolationDemoComponent,
    MultipleNumbersDemoComponent,
    SimpleDemoComponent
  ],
  template: `
<!-- for some reason the API docs come out with -1 at the end -->
<app-demo-page-header fnName="tweenSignal" />
<p>
  This function is heavily inspired by Svelte's <i>tweened</i> function.
  It allows you to create engaging simple transition animations with just a signal.
  By default this can automatically tween between a number, array of numbers, or Record of numbers.
  You can also pass an interpolation function to tween between objects of any type.
</p>
<h2>Animation Options</h2>
<p>
  Animation options can be passed when creating the signal along with signal creation options.
  They can also be changed by calling <code class="inline">setOptions</code> on the signal or by passing an optional parameter when setting the signal.
  The values passed while setting the signal will only be used for the duration of the animation.
</p>
<h2>Easings</h2>
<p>
  As a convenience a collection of easing functions are provided such as <b>easeInBack</b>.
  They can also be retrieved as a collection of all easing functions by importing <b>easings</b>.
</p>
<p>
  You can pass your own easing function.
  It should have a single numeric parameter that accepts a value between 0 and 1 and returns a value around 0 and 1.
  It is acceptable that a value might be slightly outside this range during animation, but is should always start at 0 and end at 1.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Simple Value Changes"
    pattern="tween-signal/(simple-demo|shared)"
    hiddenPattern="easing-selector"
    primaryComponentPattern="demo\.component" >
    <app-simple-demo />
  </app-demo-host>
  <app-demo-host name="Multiple Value Changes"
    pattern="tween-signal/(multiple-numbers-demo|shared)"
    hiddenPattern="easing-selector"
    primaryComponentPattern="demo\.component" >
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
