import { Injectable, computed, signal } from '@angular/core';
import { CreateReportInput, Report, ReportCategory } from './models/report';
import { approxAddress } from './geo';

/**
 * Store de reportes — IMPLEMENTACIÓN MOCK en memoria (datos ficticios).
 *
 * Cuando exista el backend, esta capa se reemplaza por una basada en
 * `httpResource()` (cliente HTTP reactivo basado en signals). El patrón sería,
 * por ejemplo, para la lista del mapa:
 *
 *   private readonly bbox = signal<string | undefined>(undefined);
 *   readonly reportsResource = httpResource<Report[]>(
 *     () => `${this.api}/reports?status=active${this.bbox() ? `&bbox=${this.bbox()}` : ''}`,
 *   );
 *
 * y para crear/confirmar, una llamada imperativa puntual con HttpClient.
 * Los componentes NO cambian: siguen leyendo signals.
 */
@Injectable({ providedIn: 'root' })
export class ReportsStore {
  private readonly _reports = signal<Report[]>(seedReports());

  /** Todos los reportes (incluye resueltos). */
  readonly reports = this._reports.asReadonly();

  /** Reportes activos (no resueltos) — los que se pintan en el mapa. */
  readonly activeReports = computed(() =>
    this._reports().filter((r) => r.status !== 'resuelto'),
  );

  /** Total de reportes activos. */
  readonly activeCount = computed(() => this.activeReports().length);

  getById(id: string): Report | undefined {
    return this._reports().find((r) => r.id === id);
  }

  create(input: CreateReportInput): Report {
    const report: Report = {
      id: newId(),
      folio: newFolio(),
      ...input,
      address: input.address ?? approxAddress(input.location),
      status: 'nuevo',
      confirmations: 0,
      createdAt: new Date().toISOString(),
    };
    this._reports.update((list) => [report, ...list]);
    return report;
  }

  confirm(id: string): void {
    this._reports.update((list) =>
      list.map((r) => (r.id === id ? { ...r, confirmations: r.confirmations + 1 } : r)),
    );
  }
}

function newId(): string {
  // crypto.randomUUID existe en navegadores modernos y en Node 19+ (SSR).
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'r-' + Date.now().toString(36);
}

let folioSeq = 0;
function newFolio(): string {
  const year = new Date().getFullYear();
  // 4 dígitos derivados del tiempo + secuencia (mock, sin Math.random).
  const n = (Date.now() + folioSeq++) % 10000;
  return `RY-${year}-${n.toString().padStart(4, '0')}`;
}

/** Datos ficticios sembrados alrededor de Torreón con IDs estables. */
function seedReports(): Report[] {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
  const seed = (
    n: number,
    category: ReportCategory,
    lat: number,
    lng: number,
    days: number,
    confirmations: number,
    description?: string,
  ): Report => ({
    id: `demo-${n}`,
    folio: `RY-2026-${(1000 + n).toString()}`,
    category,
    description,
    location: { lat, lng },
    address: approxAddress({ lat, lng }),
    status: 'nuevo',
    confirmations,
    createdAt: daysAgo(days),
  });

  return [
    seed(1, 'bache', 25.5450, -103.4090, 1, 3, 'Bache grande junto al cruce.'),
    seed(2, 'alumbrado', 25.5400, -103.4120, 5, 7, 'Tres lámparas apagadas toda la cuadra.'),
    seed(3, 'basura', 25.5475, -103.4050, 12, 14, 'Acumulación de basura en la esquina.'),
    seed(4, 'fuga_agua', 25.5360, -103.4030, 2, 21, 'Fuga constante, se desperdicia mucha agua.'),
    seed(5, 'drenaje', 25.5500, -103.4150, 40, 9, 'Drenaje tapado, mal olor.'),
    seed(6, 'semaforo', 25.5380, -103.4200, 0, 1, 'Semáforo intermitente todo el día.'),
    seed(7, 'seguridad', 25.5520, -103.3990, 8, 18, 'Poste de vigilancia sin funcionar.'),
    seed(8, 'bache', 25.5330, -103.4100, 33, 25, 'Bache que ya provocó ponchaduras.'),
  ];
}
