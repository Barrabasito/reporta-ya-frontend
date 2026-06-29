import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ReportsStore } from '../../core/reports.store';
import { ReportCard } from './report-card';

@Component({
  selector: 'app-report-success',
  imports: [ButtonModule, RouterLink, ReportCard],
  templateUrl: './report-success.html',
})
export class ReportSuccess {
  private readonly store = inject(ReportsStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly id = signal(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly report = computed(() => this.store.getById(this.id()));
}
