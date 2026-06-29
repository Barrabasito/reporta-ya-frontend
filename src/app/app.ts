import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('reporta-ya-frontend');

  protected readonly clicks = signal(0);
  protected readonly mensaje = computed(() =>
    this.clicks() === 0
      ? 'Aún sin reportes'
      : `${this.clicks()} reporte(s) registrado(s)`,
  );

  protected registrar() {
    this.clicks.update((n) => n + 1);
  }
}
