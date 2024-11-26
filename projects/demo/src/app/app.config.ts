import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { AppTitleStrategyService } from './app-title-strategy.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    { provide: TitleStrategy, useClass: AppTitleStrategyService },
    provideHighlightOptions({

        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          html: () => import('highlight.js/lib/languages/xml'),
          plaintext: () => import('highlight.js/lib/languages/plaintext'),
          typescript: () => import('highlight.js/lib/languages/typescript')
        },
    }),
    provideClientHydration()
  ]
};
