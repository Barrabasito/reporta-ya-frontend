import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly brand = signal('Reporta Ya');
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly isDark = this.themeService.isDark;

  /** URL actual (vía router) como signal. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Flujos enfocados (sin header de acción ni bottom-nav). */
  protected readonly chromeless = computed(() => {
    const u = this.url();
    return u.startsWith('/reportar') || u.startsWith('/enviado');
  });

  protected toggleTheme(): void {
    this.themeService.toggle();
  }
}
