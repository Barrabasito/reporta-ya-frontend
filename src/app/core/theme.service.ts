import { Injectable, afterNextRender, computed, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'reporta-ya-theme';

/**
 * Tema claro/oscuro manual (NO sigue el tema del sistema operativo).
 * Aplica la clase `.app-dark` en <html>, que activa el modo oscuro de PrimeNG
 * (ver `darkModeSelector` en app.config.ts) y el variante `dark:` de Tailwind.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('light');
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Aplica la clase y persiste cada vez que cambia (guardado SSR-safe).
    effect(() => {
      const theme = this.theme();
      if (typeof document === 'undefined') return;
      document.documentElement.classList.toggle('app-dark', theme === 'dark');
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* almacenamiento no disponible */
      }
    });

    // Lee la preferencia guardada al arrancar en el navegador.
    afterNextRender(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          this.theme.set(saved);
        }
      } catch {
        /* almacenamiento no disponible */
      }
    });
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
