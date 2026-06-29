import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ReportsStore } from '../../core/reports.store';
import { DEFAULT_CENTER, approxAddress } from '../../core/geo';
import { CATEGORY_META, GeoPoint, ReportCategory } from '../../core/models/report';

@Component({
  selector: 'app-report-form',
  imports: [FormsModule, ButtonModule, SelectModule, TextareaModule, RouterLink],
  templateUrl: './report-form.html',
})
export class ReportForm {
  private readonly store = inject(ReportsStore);
  private readonly router = inject(Router);

  protected readonly categories = (Object.keys(CATEGORY_META) as ReportCategory[]).map((value) => ({
    value,
    label: CATEGORY_META[value].label,
    icon: CATEGORY_META[value].icon,
  }));

  protected readonly category = signal<ReportCategory | null>(null);
  protected readonly description = signal('');
  protected readonly location = signal<GeoPoint | null>(null);
  protected readonly locating = signal(false);
  protected readonly submitted = signal(false);

  protected readonly addressLabel = computed(() => {
    const loc = this.location();
    return loc ? approxAddress(loc) : null;
  });

  protected readonly canSubmit = computed(() => !!this.category() && !!this.location());

  protected locate(): void {
    this.submitted.set(false);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.location.set(DEFAULT_CENTER);
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.location.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        this.locating.set(false);
      },
      () => {
        // Permiso denegado o error: usa el centro por defecto.
        this.location.set(DEFAULT_CENTER);
        this.locating.set(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  protected submit(): void {
    this.submitted.set(true);
    const category = this.category();
    const location = this.location();
    if (!category || !location) return;

    const report = this.store.create({
      category,
      location,
      description: this.description().trim() || undefined,
    });
    this.router.navigate(['/reporte', report.id]);
  }
}
