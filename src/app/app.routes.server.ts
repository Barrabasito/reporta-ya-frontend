import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Ficha de reporte: render en servidor para que los crawlers de FB/WhatsApp
  // reciban meta tags + Open Graph (link compartible con buena vista previa).
  {
    path: 'reporte/:id',
    renderMode: RenderMode.Server,
  },
  // El resto (mapa, formulario) es interactivo y vive en el cliente.
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
