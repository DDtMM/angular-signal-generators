import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { InterpolationDemoComponent } from '../../demos/tween-signal/interpolation-demo/interpolation-demo.component';
import { MultipleNumbersDemoComponent } from '../../demos/tween-signal/multiple-numbers-demo/multiple-numbers-demo.component';
import { SimpleTweenDemoComponent } from '../../demos/tween-signal/simple-tween-demo/simple-tween-demo.component';


@Component({
    selector: 'app-tween-signal-page',
    imports: [
        DemoHostComponent,
        MemberPageHeaderComponent,
        InterpolationDemoComponent,
        MultipleNumbersDemoComponent,
        RouterLink,
        SimpleTweenDemoComponent
    ],
    template: `
<!-- for some reason the API docs come out with -1 at the end -->
<app-member-page-header fnName="tweenSignal" />
<p>
  The <i>tweenSignal</i> and <i><a routerLink="/spring-signal" class="link">springSignal</a></i> functions are heavily inspired by Svelte's <i>motion</i> functions.
  They allow you to create engaging transition animations with just a signal.
  By default, they can automatically transition between a number, array of numbers, or Record of numbers.
  An interpolation function can be passed to enable transitioning between values of any type.
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
  These can be imported from the submodule, <code class="inline">&#64;ddtmm/angular-signal-generators/easings</code>.
</p>
<p>
  You can pass your own easing function.
  It should have a single numeric parameter that accepts a value between 0 and 1 and returns a value around 0 and 1.
  It is acceptable that a value might be slightly outside this range during animation, but is should always start at 0 and end at 1.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Simple Value Changes"
    pattern="tween-signal/(simple-tween-demo|shared)"
    hiddenPattern="easing-selector">
    <app-simple-tween-demo />
  </app-demo-host>
  <app-demo-host name="Animation Multiple Values"
    pattern="tween-signal/(multiple-numbers-demo|shared)"
    hiddenPattern="easing-selector">
    <p>
      You can tween between array values of equal length.
      Here the array is an set of coordinates that changes with each click of the control surface.
    </p>
    <app-multiple-numbers-demo />
  </app-demo-host>
  <app-demo-host name="Fun with Interpolation" pattern="tween-signal/interpolation-demo/">
    <p>
      You can tween between anything as long as there is an interpolation function that can translate progress into a value.
    </p>
    <app-interpolation-demo />
  </app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TweenSignalPageComponent {}
