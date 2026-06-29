import { GeoPoint } from './models/report';

/** Centro por defecto del mapa (Torreón, Coahuila) cuando no hay geolocalización. */
export const DEFAULT_CENTER: GeoPoint = { lat: 25.5428, lng: -103.4068 };

/** Días transcurridos desde una fecha ISO. */
export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Color del marcador según antigüedad sin atender (verde → rojo). */
export function ageColor(days: number): string {
  if (days < 3) return '#22c55e'; // verde — reciente
  if (days < 7) return '#eab308'; // amarillo
  if (days < 30) return '#f97316'; // naranja
  return '#ef4444'; // rojo — abandonado
}

/** Etiqueta humana de antigüedad. */
export function ageLabel(days: number): string {
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
}

/**
 * Redondea la coordenada para PROTEGER la privacidad: la "difumina" a ~110 m
 * (3 decimales). Así no se guarda la posición exacta de quien reporta.
 * Aplícalo SIEMPRE antes de almacenar/enviar una ubicación.
 */
export function roundApprox(p: GeoPoint): GeoPoint {
  return {
    lat: Math.round(p.lat * 1000) / 1000,
    lng: Math.round(p.lng * 1000) / 1000,
  };
}

/** Etiqueta de dirección aproximada (privacidad: no exacta). */
export function approxAddress(p: GeoPoint): string {
  const { lat, lng } = roundApprox(p);
  return `Aprox. ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}
