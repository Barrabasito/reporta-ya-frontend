import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ReportsStore } from '../../core/reports.store';
import { ageColor, ageLabel, daysSince } from '../../core/geo';
import { CATEGORY_META } from '../../core/models/report';

@Component({
  selector: 'app-report-detail',
  imports: [ButtonModule, TagModule, RouterLink],
  templateUrl: './report-detail.html',
})
export class ReportDetail {
  private readonly store = inject(ReportsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly id = signal(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly justCopied = signal(false);

  protected readonly report = computed(() => this.store.getById(this.id()));
  protected readonly meta_ = CATEGORY_META;

  protected readonly days = computed(() => {
    const r = this.report();
    return r ? daysSince(r.createdAt) : 0;
  });
  protected readonly color = computed(() => ageColor(this.days()));
  protected readonly ageText = computed(() => ageLabel(this.days()));

  constructor() {
    // SEO + Open Graph: se ejecuta en el servidor (RenderMode.Server) para que
    // los crawlers de FB/WhatsApp reciban una vista previa rica.
    effect(() => {
      const r = this.report();
      if (!r) {
        this.title.setTitle('Reporte no encontrado — Reporta Ya');
        return;
      }
      const cat = CATEGORY_META[r.category].label;
      const days = daysSince(r.createdAt);
      const title = `${cat} — ${days} días sin atender · Reporta Ya`;
      const desc =
        r.description?.trim() ||
        `Reporte ciudadano de ${cat.toLowerCase()} en ${r.address}. ${r.confirmations} vecinos lo han confirmado.`;
      // OG-image de demostración (placehold.co). En producción: imagen dinámica
      // con mini-mapa + categoría + contador generada en una función edge.
      const og = `https://placehold.co/1200x630/${ageColor(days).slice(1)}/ffffff/png?text=${encodeURIComponent(cat + ' · ' + days + 'd')}`;

      this.title.setTitle(title);
      this.setMeta('description', desc);
      this.setMeta('og:title', title, true);
      this.setMeta('og:description', desc, true);
      this.setMeta('og:image', og, true);
      this.setMeta('og:type', 'article', true);
      this.setMeta('twitter:card', 'summary_large_image');
    });
  }

  private setMeta(name: string, content: string, property = false): void {
    const selector = property ? `property="${name}"` : `name="${name}"`;
    if (this.meta.getTag(selector)) {
      this.meta.updateTag(property ? { property: name, content } : { name, content });
    } else {
      this.meta.addTag(property ? { property: name, content } : { name, content });
    }
  }

  protected confirm(): void {
    this.store.confirm(this.id());
  }

  protected async share(): Promise<void> {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const r = this.report();
    const text = r ? `${CATEGORY_META[r.category].label} sin atender — Reporta Ya` : 'Reporta Ya';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Reporta Ya', text, url });
      } catch {
        /* el usuario canceló */
      }
    } else {
      await navigator.clipboard?.writeText(url);
      this.justCopied.set(true);
      setTimeout(() => this.justCopied.set(false), 2000);
    }
  }
}
