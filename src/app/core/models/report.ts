/**
 * Modelos del dominio de reportes ciudadanos.
 *
 * NOTA: este es el contrato PROPUESTO. Ajusta los nombres de campos para que
 * coincidan con tu backend (o mapéalos en el servicio si prefieres no tocarlos).
 */

/** Punto geográfico. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Categoría del reporte. */
export type ReportCategory =
  | 'bache'
  | 'alumbrado'
  | 'basura'
  | 'fuga_agua'
  | 'drenaje'
  | 'semaforo'
  | 'seguridad'
  | 'otro';

/** Ciclo de vida del reporte. */
export type ReportStatus = 'nuevo' | 'en_proceso' | 'resuelto';

/** Un reporte tal como lo devuelve el backend. */
export interface Report {
  id: string;
  category: ReportCategory;
  description?: string;
  location: GeoPoint;
  /** Dirección aproximada (no exacta, por privacidad). */
  address?: string;
  status: ReportStatus;
  /** Número de confirmaciones "yo también lo veo". */
  confirmations: number;
  /** ISO 8601, p. ej. "2026-06-29T18:00:00Z". */
  createdAt: string;
  updatedAt?: string;
  photoUrl?: string;
}

/** Payload para crear un reporte (POST). */
export interface CreateReportInput {
  category: ReportCategory;
  description?: string;
  location: GeoPoint;
  address?: string;
}

/** Metadatos de presentación por categoría (icono PrimeIcons + etiqueta). */
export const CATEGORY_META: Record<ReportCategory, { label: string; icon: string }> = {
  bache: { label: 'Bache', icon: 'pi pi-exclamation-triangle' },
  alumbrado: { label: 'Alumbrado', icon: 'pi pi-lightbulb' },
  basura: { label: 'Basura', icon: 'pi pi-trash' },
  fuga_agua: { label: 'Fuga de agua', icon: 'pi pi-tint' },
  drenaje: { label: 'Drenaje', icon: 'pi pi-filter' },
  semaforo: { label: 'Semáforo', icon: 'pi pi-stop-circle' },
  seguridad: { label: 'Seguridad', icon: 'pi pi-shield' },
  otro: { label: 'Otro', icon: 'pi pi-map-marker' },
};
