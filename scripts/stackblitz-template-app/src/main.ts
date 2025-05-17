import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { $$DemoClass$$ } from './$$DemoPath$$';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [$$DemoClass$$],
  template: '<$$DemoSelector$$ />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent { }

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] });
