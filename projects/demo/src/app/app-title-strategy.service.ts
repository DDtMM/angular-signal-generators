import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppTitleStrategyService extends TitleStrategy {
  private readonly title = inject(Title);
  updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot) || '';
    const outputTitle = (routeTitle.trim() !== '') ? `Angular Signal Generators: ${routeTitle}` : 'Angular Signal Generators';
    this.title.setTitle(outputTitle);
  }
}
