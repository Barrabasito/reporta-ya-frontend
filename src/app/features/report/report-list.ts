import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportsStore } from '../../core/reports.store';
import { CATEGORY_META } from '../../core/models/report';
import { daysSince } from '../../core/geo';
import { ReportCard } from './report-card';

@Component({
  selector: 'app-report-list',
  imports: [FormsModule, ReportCard],
  templateUrl: './report-list.html',
})
export class ReportList {
  private readonly store = inject(ReportsStore);

  protected readonly query = signal('');

  protected readonly reports = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = [...this.store.activeReports()].sort(
      (a, b) => daysSince(b.createdAt) - daysSince(a.createdAt),
    );
    if (!q) return list;
    return list.filter((r) => {
      const hay = `${CATEGORY_META[r.category].label} ${r.address ?? ''} ${r.description ?? ''} ${r.folio}`;
      return hay.toLowerCase().includes(q);
    });
  });
}
