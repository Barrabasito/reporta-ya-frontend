import { InjectionToken } from '@angular/core';

/**
 * URL base de tu backend. Se provee en `app.config.ts` desde `environment`.
 * La implementación real de `ReportsStore` basada en `httpResource()` la
 * inyectará para construir las URLs.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
