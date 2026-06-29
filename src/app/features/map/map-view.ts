import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import type { Map as MapLibreMap, Marker, StyleSpecification } from 'maplibre-gl';
import { ReportsStore } from '../../core/reports.store';
import { DEFAULT_CENTER, ageColor, daysSince } from '../../core/geo';
import { CATEGORY_META, Report } from '../../core/models/report';
import { ThemeService, Theme } from '../../core/theme.service';

@Component({
  selector: 'app-map-view',
  imports: [ButtonModule, RouterLink],
  templateUrl: './map-view.html',
})
export class MapView {
  private readonly store = inject(ReportsStore);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('map');

  /** El mapa solo existe en el navegador. */
  private map: MapLibreMap | null = null;
  private markers: Marker[] = [];
  private readonly ready = signal(false);

  protected readonly reports = this.store.activeReports;
  protected readonly count = this.store.activeCount;
  protected readonly oldest = computed(() => {
    const list = this.reports();
    if (!list.length) return 0;
    return Math.max(...list.map((r) => daysSince(r.createdAt)));
  });

  constructor() {
    // Inicializa MapLibre solo en cliente (afterNextRender no corre en SSR).
    afterNextRender(async () => {
      const { Map } = await import('maplibre-gl');
      this.map = new Map({
        container: this.mapEl().nativeElement,
        style: buildStyle(this.themeService.theme()),
        center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
        zoom: 13,
        attributionControl: { compact: true },
      });
      this.map.on('load', () => this.ready.set(true));
    });

    // Re-pinta los marcadores cuando cambian los reportes (signals puros).
    effect(() => {
      const reports = this.reports();
      if (!this.ready()) return;
      void this.renderMarkers(reports);
    });

    // Cambia el estilo del mapa al alternar el tema. Los marcadores son
    // overlays del DOM, así que sobreviven a setStyle.
    effect(() => {
      const theme = this.themeService.theme();
      if (!this.map || !this.ready()) return;
      this.map.setStyle(buildStyle(theme));
    });
  }

  private async renderMarkers(reports: Report[]): Promise<void> {
    if (!this.map) return;
    const { Marker, Popup } = await import('maplibre-gl');

    for (const m of this.markers) m.remove();
    this.markers = [];

    for (const r of reports) {
      const days = daysSince(r.createdAt);
      const el = document.createElement('div');
      el.className = 'report-pin';
      el.style.background = ageColor(days);
      el.innerHTML = `<i class="${CATEGORY_META[r.category].icon}"></i>`;

      const popup = new Popup({ offset: 24, closeButton: false }).setHTML(
        `<strong>${CATEGORY_META[r.category].label}</strong><br>` +
          `<span style="color:#64748b">${r.confirmations} confirmaciones · ${days} días</span><br>` +
          `<a data-id="${r.id}" class="popup-link" href="/reporte/${r.id}">Ver ficha →</a>`,
      );

      const marker = new Marker({ element: el })
        .setLngLat([r.location.lng, r.location.lat])
        .setPopup(popup)
        .addTo(this.map);

      // Navegación SPA desde el popup.
      popup.on('open', () => {
        const link = document.querySelector<HTMLAnchorElement>('.popup-link');
        link?.addEventListener('click', (ev) => {
          ev.preventDefault();
          this.router.navigate(['/reporte', r.id]);
        });
      });

      this.markers.push(marker);
    }
  }
}

/** Estilo raster con basemaps de Carto (claro/oscuro) + capa de fondo para que
 *  el mapa nunca se vea negro mientras cargan los tiles. Gratis con atribución. */
function buildStyle(theme: Theme): StyleSpecification {
  const variant = theme === 'dark' ? 'dark_all' : 'light_all';
  const bg = theme === 'dark' ? '#0b1120' : '#e5e7eb';
  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
          `https://b.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
          `https://c.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap, © CARTO',
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': bg } },
      { id: 'carto', type: 'raster', source: 'carto' },
    ],
  };
}
