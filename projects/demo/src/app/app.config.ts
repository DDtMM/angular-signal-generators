import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript')
        },
        //themePath: 'path-to-theme.css' // Optional, and useful if you want to change the theme dynamically
      }
    }
  ]
};
