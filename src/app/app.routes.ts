import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/map/map-view').then((m) => m.MapView),
    title: 'Reporta Ya — Mapa de reportes ciudadanos',
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/report/report-list').then((m) => m.ReportList),
    title: 'Reportes — Reporta Ya',
  },
  {
    path: 'reportar',
    loadComponent: () => import('./features/report/report-form').then((m) => m.ReportForm),
    title: 'Nuevo reporte — Reporta Ya',
  },
  {
    path: 'enviado/:id',
    loadComponent: () => import('./features/report/report-success').then((m) => m.ReportSuccess),
    title: 'Reporte enviado — Reporta Ya',
  },
  {
    path: 'reporte/:id',
    loadComponent: () => import('./features/report/report-detail').then((m) => m.ReportDetail),
  },
  { path: '**', redirectTo: '' },
];
