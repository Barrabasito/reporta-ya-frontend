import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly brand = signal('Reporta Ya');
  private readonly themeService = inject(ThemeService);

  protected readonly isDark = this.themeService.isDark;
  protected toggleTheme(): void {
    this.themeService.toggle();
  }
}
