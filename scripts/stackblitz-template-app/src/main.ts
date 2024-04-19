import { Component } from '@angular/core';
import { $$DemoClass$$ } from './$$DemoPath$$';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [$$DemoClass$$],
  template: '<$$DemoSelector$$ />'
})
export class AppComponent { }

bootstrapApplication(AppComponent);
