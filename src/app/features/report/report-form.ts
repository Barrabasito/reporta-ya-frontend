import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ReportsStore } from '../../core/reports.store';
import { DEFAULT_CENTER, approxAddress, roundApprox } from '../../core/geo';
import { CATEGORY_META, GeoPoint, ReportCategory } from '../../core/models/report';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-report-form',
  imports: [FormsModule, ButtonModule, TextareaModule],
  templateUrl: './report-form.html',
})
export class ReportForm {
  private readonly store = inject(ReportsStore);
  private readonly router = inject(Router);

  protected readonly steps = [
    { n: 1, label: 'Categoría' },
    { n: 2, label: 'Ubicación' },
    { n: 3, label: 'Revisar' },
  ] as const;

  protected readonly categories = (Object.keys(CATEGORY_META) as ReportCategory[]).map((value) => ({
    value,
    label: CATEGORY_META[value].label,
    icon: CATEGORY_META[value].icon,
  }));
  protected readonly meta = CATEGORY_META;

  protected readonly step = signal<Step>(1);
  protected readonly category = signal<ReportCategory | null>(null);
  protected readonly description = signal('');
  protected readonly photo = signal<string | null>(null);
  protected readonly location = signal<GeoPoint | null>(null);
  protected readonly locating = signal(false);

  protected readonly addressLabel = computed(() => {
    const loc = this.location();
    return loc ? approxAddress(loc) : null;
  });

  protected select(category: ReportCategory): void {
    this.category.set(category);
  }

  protected next(): void {
    if (this.step() === 1 && !this.category()) return;
    if (this.step() === 2 && !this.location()) return;
    this.step.update((s) => Math.min(3, s + 1) as Step);
  }

  protected back(): void {
    if (this.step() === 1) {
      this.router.navigate(['/']);
      return;
    }
    this.step.update((s) => Math.max(1, s - 1) as Step);
  }

  protected onPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.photo.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected removePhoto(): void {
    this.photo.set(null);
  }

  protected locate(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.location.set(DEFAULT_CENTER);
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Difuminamos la coordenada (~110 m) antes de guardarla: nunca exacta.
        this.location.set(roundApprox({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        this.locating.set(false);
      },
      () => {
        this.location.set(DEFAULT_CENTER);
        this.locating.set(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  protected submit(): void {
    const category = this.category();
    const location = this.location();
    if (!category || !location) return;

    const report = this.store.create({
      category,
      location,
      description: this.description().trim() || undefined,
      photoUrl: this.photo() ?? undefined,
    });
    this.router.navigate(['/enviado', report.id]);
  }
}
