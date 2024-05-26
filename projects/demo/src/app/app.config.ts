import { ApplicationConfig } from '@angular/core';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { AppTitleStrategyService } from './app-title-strategy.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    { provide: TitleStrategy, useClass: AppTitleStrategyService },
    provideHighlightOptions({

        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          html: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript')
        },
    }),
    provideClientHydration()
  ]
};
