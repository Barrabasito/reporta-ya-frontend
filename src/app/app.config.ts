import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Cliente HTTP moderno basado en fetch. Requerido por `httpResource()`,
    // el cliente HTTP reactivo basado en signals.
    provideHttpClient(withFetch()),
  ],
};
