import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ageColor, ageLabel, daysSince } from '../../core/geo';
import { CATEGORY_META, Report } from '../../core/models/report';

@Component({
  selector: 'app-report-card',
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="['/reporte', report().id]"
      class="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <!-- Imagen / cabecera de color -->
      <div class="relative h-40 w-full">
        @if (report().photoUrl) {
          <img [src]="report().photoUrl" alt="" class="h-full w-full object-cover" />
        } @else {
          <div
            class="flex h-full w-full items-center justify-center"
            [style.background]="'linear-gradient(135deg,' + color() + '33,' + color() + '11)'"
          >
            <i [class]="meta[report().category].icon" class="text-4xl" [style.color]="color()"></i>
          </div>
        }
        <span
          class="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          [style.background]="color()"
        >
          {{ statusLabel() }}
        </span>
      </div>

      <!-- Cuerpo -->
      <div class="p-4">
        <p class="flex items-center gap-1 text-xs text-slate-400">
          <i class="pi pi-map-marker text-[10px]"></i> {{ report().address }}
        </p>
        <h3 class="mt-1 font-bold text-slate-800 dark:text-slate-100">
          {{ meta[report().category].label }}
        </h3>
        @if (report().description) {
          <p class="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {{ report().description }}
          </p>
        }
        <div
          class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800"
        >
          <span class="font-mono">{{ report().folio }}</span>
          <span>{{ age() }}</span>
        </div>
      </div>
    </a>
  `,
})
export class ReportCard {
  readonly report = input.required<Report>();
  protected readonly meta = CATEGORY_META;

  protected readonly days = computed(() => daysSince(this.report().createdAt));
  protected readonly color = computed(() => ageColor(this.days()));
  protected readonly age = computed(() => ageLabel(this.days()));
  protected readonly statusLabel = computed(() => {
    switch (this.report().status) {
      case 'resuelto':
        return 'Resuelto';
      case 'en_proceso':
        return 'En proceso';
      default:
        return 'Pendiente';
    }
  });
}
