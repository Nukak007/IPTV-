# AGENTS.md — budgets-service

Microservicio del monorepo **Centavo** encargado de la definición, administración
y consulta de presupuestos financieros por categoría y periodo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js ≥ 20, TypeScript 5 |
| Framework | Express 5 |
| ORM | Prisma 5 (SQLite dev / PostgreSQL prod) |
| Validación | Zod 3 |
| Tests | Vitest + Supertest |

---

## Estructura de módulos

```
src/
├── app.ts                    # Factory de la app Express (sin side-effects)
├── server.ts                 # Entry point — conecta DB y levanta el servidor
├── config/
│   └── env.ts                # Variables de entorno validadas con Zod
├── lib/
│   └── prisma.ts             # Singleton de PrismaClient
├── middlewares/
│   ├── errorHandler.ts       # Manejador global + clase AppError
│   └── validateRequest.ts    # Middleware factory para validar body/query/params
└── modules/
    └── budgets/
        ├── budget.routes.ts      # Router Express
        ├── budget.controller.ts  # Handlers HTTP
        ├── budget.service.ts     # Lógica de negocio
        ├── budget.repository.ts  # Acceso a Prisma
        ├── budget.schema.ts      # Schemas Zod + DTOs
        └── budget.types.ts       # Re-exports de tipos Prisma
```

---

## Convenciones de código

- **Módulos**: cada dominio vive en `src/modules/<nombre>/` con los archivos
  `.routes.ts`, `.controller.ts`, `.service.ts`, `.repository.ts`,
  `.schema.ts` y `.types.ts`.
- **Respuestas HTTP**: siempre envolver en `{ status: 'success', data: ... }`.
  Los errores usan `{ status: 'error', message: ... }`.
- **Errores conocidos**: lanzar `AppError(statusCode, mensaje)` desde la
  capa de servicio; el `errorHandler` los serializa automáticamente.
- **Validación**: usar `validateRequest(schema, 'body'|'query'|'params')`
  como middleware antes del controller.
- **Paginación**: los endpoints de listado aceptan `?page=&limit=` y
  devuelven `meta: { total, page, limit, totalPages }`.

---

## Endpoints

### Budgets — `/api/v1/budgets`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear presupuesto (`category`, `limitAmount`, `period`, etc.) |
| `GET` | `/` | Consultar y listar presupuestos (paginado, filtrable por categoría o periodo) |
| `GET` | `/:id` | Obtener presupuesto por ID |
| `PATCH` | `/:id` | Actualizar parcialmente un presupuesto |
| `DELETE` | `/:id` | Eliminar presupuesto |

Filtros disponibles en `GET /`: `category`, `period` (`DAILY`\|`WEEKLY`\|`MONTHLY`\|`YEARLY`), `page`, `limit`.

---

## Comandos clave

```bash
# Desarrollo
npm run dev          # tsx watch src/server.ts — hot reload en :3003

# Base de datos
npm run db:push      # sincronizar schema.prisma con la base de datos
npm run db:studio    # abrir Prisma Studio

# Testing
npm run test         # ejecutar vitest
npm run test:watch   # modo observador

# Compilación y producción
npm run build        # compilar TypeScript a dist/
npm run start        # ejecutar build en producción
```
