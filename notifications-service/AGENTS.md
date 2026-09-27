# AGENTS.md — notifications-service

Microservicio del monorepo **Centavo** encargado de generar alertas de sobregasto,
monitorear umbrales presupuestarios y administrar el historial de notificaciones.

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
│   ├── prisma.ts             # Singleton de PrismaClient
│   └── budgetClient.ts       # Cliente HTTP resiliente para consulta a budgets-service
├── middlewares/
│   ├── errorHandler.ts       # Manejador global + clase AppError
│   └── validateRequest.ts    # Middleware factory para validar body/query/params
└── modules/
    └── notifications/
        ├── notification.routes.ts      # Router Express
        ├── notification.controller.ts  # Handlers HTTP
        ├── notification.service.ts     # Lógica de detección de sobregasto y alertas
        ├── notification.repository.ts  # Acceso a Prisma
        ├── notification.schema.ts      # Schemas Zod + DTOs
        └── notification.types.ts       # Tipos TypeScript
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

### Notifications — `/api/v1/notifications`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/events/transaction` | Recibe evento de nueva transacción y evalúa si dispara alerta de sobregasto contra el presupuesto |
| `GET` | `/` | Consultar y listar notificaciones (paginado, filtrable por categoría, tipo o estado de lectura) |
| `GET` | `/:id` | Obtener notificación por ID |
| `PATCH` | `/:id/read` | Marcar notificación como leída o no leída (`isRead: true/false`) |
| `DELETE` | `/:id` | Eliminar notificación |

Filtros disponibles en `GET /`: `category`, `isRead` (`true`\|`false`), `type` (`OVERSPEND_ALERT`\|`BUDGET_WARNING`\|`SYSTEM`), `page`, `limit`.

---

## Comandos clave

```bash
# Desarrollo
npm run dev          # tsx watch src/server.ts — hot reload en :3004

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

---

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3004` |
| `NODE_ENV` | Entorno | `development` |
| `DATABASE_URL` | Cadena de conexión Prisma | `file:./dev.db` |
| `BUDGETS_SERVICE_URL` | URL del servicio de presupuestos | `http://localhost:3003` |
| `DEFAULT_ALERT_THRESHOLD` | Umbral de alerta por defecto | `1.0` |

---

## Modelo de datos (Prisma)

```prisma
model Notification {
  id            String   @id @default(cuid())
  type          String   @default("OVERSPEND_ALERT")
  title         String
  message       String
  category      String
  transactionId String?
  amount        Float?
  budgetLimit   Float
  currentSpent  Float
  excessAmount  Float?
  percentage    Float
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```
