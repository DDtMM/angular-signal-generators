import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { MemberPageHeaderComponent } from '../../controls/member-page-header.component';
import { SimpleSpringDemoComponent } from '../../demos/spring-signal/simple-spring-demo/simple-spring-demo.component';
import { MultipleSpringNumbersDemoComponent } from '../../demos/spring-signal/multiple-spring-numbers-demo/multiple-spring-numbers-demo.component';


@Component({
    selector: 'app-spring-signal-page',
    imports: [
        DemoHostComponent,
        MemberPageHeaderComponent,
        MultipleSpringNumbersDemoComponent,
        RouterLink,
        SimpleSpringDemoComponent
    ],
    template: `
<!-- for some reason the API docs come out with -1 at the end -->
<app-member-page-header fnName="springSignal" />
<p>
  The <i>springSignal</i> and <i><a routerLink="/tween-signal" class="link">tweenSignal</a></i> functions are heavily inspired by Svelte's <i>motion</i> functions.
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
<h2>Spring Parameters</h2>
<p>
  The motion of the spring animation can be controlled using the <code class="inline">stiffness</code> and <code class="inline">damping</code> parameters.
  Both of these accept a number between 0 and 1, though values at the extremes will have an unfavorable effect.
  Because the motion can exceed the desired bounds of the signal, 
  a <code class="inline">clamp</code> option can be set to constrain the animation to the start and destination value of the signal.
</p>
<div class="flex flex-col gap-6">
  <app-demo-host name="Simple Value Changes"
    pattern="spring-signal/(simple-spring-demo|shared)"
    hiddenPattern="spring-options" >
    <app-simple-spring-demo />
  </app-demo-host>
  <app-demo-host name="Animating Multiple Values"
    pattern="spring-signal/(multiple-spring-numbers-demo|shared)"
    hiddenPattern="spring-options" >
    <p>Click the surface to update the 2D coordinates and see the spring animation.</p>
    <app-multiple-spring-numbers-demo />
  </app-demo-host>
</div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpringSignalPageComponent {}
