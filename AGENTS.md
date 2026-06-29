# AGENTS.md — reporta-ya-frontend

Instrucciones para cualquier agente de IA (Claude Code, etc.) que trabaje en este repositorio.

## Stack

- **Angular 22** (standalone, **zoneless** — sin `zone.js`).
- **TypeScript** estricto.
- Estilos en **SCSS**.

## Reglas de arquitectura — OBLIGATORIAS

### 1. Solo signals puros

Toda la reactividad se modela con la API de **signals** de Angular. **No** se usan RxJS `Observable`s, `Subject`s, `BehaviorSubject`s ni el patrón `async` pipe para el estado de la aplicación.

- Estado local de componente: `signal()`.
- Estado derivado: `computed()`.
- Efectos secundarios: `effect()` (úsalo con moderación; preferir estado derivado).
- Inputs / outputs / two-way: `input()`, `output()`, `model()` (API basada en signals), **no** los decoradores `@Input()` / `@Output()`.
- Consultas de vista: `viewChild()`, `viewChildren()`, `contentChild()` (basadas en signals), **no** `@ViewChild()`.
- En plantillas usa el flujo de control nativo: `@if`, `@for`, `@switch`. No `*ngIf` / `*ngFor`.

```ts
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-contador',
  template: `
    <button (click)="incrementar()">{{ doble() }}</button>
  `,
})
export class Contador {
  readonly valor = signal(0);
  readonly doble = computed(() => this.valor() * 2);
  incrementar() {
    this.valor.update((v) => v + 1);
  }
}
```

### 2. Cliente HTTP basado en signals — `httpResource()`

Para datos del servidor usa **`httpResource()`** (el cliente HTTP reactivo basado en signals de `@angular/common/http`). Devuelve un recurso reactivo con signals (`.value()`, `.status()`, `.error()`, `.isLoading()`) que se vuelve a ejecutar automáticamente cuando cambian sus dependencias signal.

- **No** uses `HttpClient.get()` con `.subscribe()` para leer datos en componentes.
- `provideHttpClient(withFetch())` ya está configurado en `src/app/app.config.ts`.
- Para mutaciones (POST/PUT/DELETE puntuales) sí puedes usar `httpResource` reactivo o, si necesitas una llamada imperativa, envuelve `HttpClient` y convierte el resultado a signal con `toSignal` solo como último recurso. Preferir siempre `httpResource`.

```ts
import { Component, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';

interface Reporte {
  id: number;
  titulo: string;
}

@Component({
  selector: 'app-reportes',
  template: `
    @if (reportes.isLoading()) {
      <p>Cargando…</p>
    } @else if (reportes.error()) {
      <p>Error al cargar.</p>
    } @else {
      @for (r of reportes.value(); track r.id) {
        <li>{{ r.titulo }}</li>
      }
    }
  `,
})
export class Reportes {
  readonly pagina = signal(1);

  // Se re-ejecuta automáticamente cuando `pagina()` cambia.
  readonly reportes = httpResource<Reporte[]>(
    () => `/api/reportes?pagina=${this.pagina()}`,
  );
}
```

### 3. Inyección de dependencias

Usa la función `inject()` en lugar de inyección por constructor.

```ts
private readonly router = inject(Router);
```

## Convenciones

- Componentes standalone (sin `NgModule`).
- Change detection: el proyecto es zoneless; confía en signals para disparar la actualización de la vista.
- Nombres de archivo según el esquema de Angular CLI (`*.ts`, `*.html`, `*.scss`, `*.spec.ts`).
- Genera artefactos con `ng generate` cuando sea posible.

## Comandos

```bash
npm start        # ng serve — servidor de desarrollo
npm run build    # build de producción
npm test         # tests con Vitest
```

## Qué NO hacer

- ❌ RxJS para estado de la aplicación.
- ❌ `@Input()` / `@Output()` / `@ViewChild()` (decoradores).
- ❌ `*ngIf` / `*ngFor` (usa `@if` / `@for`).
- ❌ `HttpClient.subscribe()` para leer datos (usa `httpResource()`).
- ❌ `NgModule`.
- ❌ Reintroducir `zone.js`.
