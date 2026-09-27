# AGENTS.md — transactions-service

Microservicio del monorepo **Centavo** encargado del registro y categorización
de transacciones financieras (ingresos y gastos).

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
    ├── transactions/
    │   ├── transaction.routes.ts      # Router Express
    │   ├── transaction.controller.ts  # Handlers HTTP
    │   ├── transaction.service.ts     # Lógica de negocio
    │   ├── transaction.repository.ts  # Acceso a Prisma
    │   ├── transaction.schema.ts      # Schemas Zod + DTOs
    │   └── transaction.types.ts       # Re-exports de tipos Prisma
    └── categories/
        ├── category.routes.ts         # Router Express
        ├── category.controller.ts     # Handlers HTTP
        ├── category.service.ts        # Lógica de negocio
        ├── category.repository.ts     # Acceso a Prisma
        ├── category.schema.ts         # Schemas Zod + DTOs
        └── category.types.ts          # Re-exports de tipos Prisma
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

### Transactions — `/api/v1/transactions`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear transacción |
| `GET` | `/` | Listar (paginado, filtrable) |
| `GET` | `/:id` | Obtener por ID |
| `PATCH` | `/:id` | Actualizar parcialmente |
| `DELETE` | `/:id` | Eliminar |

Filtros disponibles en `GET /`: `categoryId`, `type` (`INCOME`\|`EXPENSE`),
`from` (ISO 8601), `to` (ISO 8601), `page`, `limit`.

### Categories — `/api/v1/categories`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar todas |
| `POST` | `/` | Crear categoría |
| `GET` | `/:id` | Obtener por ID |
| `PATCH` | `/:id` | Actualizar parcialmente |
| `DELETE` | `/:id` | Eliminar |

---

## Comandos clave

```bash
# Desarrollo
npm run dev          # tsx watch src/server.ts — hot reload en :3002

# Base de datos
npm run db:push      # Sincronizar schema sin migración (dev)
npm run db:migrate   # Migración formal con historial
npm run db:seed      # Insertar categorías predeterminadas
npm run db:studio    # Prisma Studio en el navegador

# Tests
npm test             # Vitest (modo CI)
npm run test:watch   # Vitest en modo watch
npm run test:coverage

# Build
npm run build        # tsc → dist/
npm start            # node dist/server.js
```

---

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3002` |
| `NODE_ENV` | Entorno | `development` |
| `DATABASE_URL` | Cadena de conexión Prisma | `file:./dev.db` |

---

## Modelo de datos (Prisma)

```prisma
model Category {
  id           String        @id @default(cuid())
  name         String        @unique
  icon         String?       // emoji
  color        String?       // hex, ej: "#FF6B6B"
  transactions Transaction[]
  createdAt    DateTime      @default(now())
}

model Transaction {
  id          String   @id @default(cuid())
  amount      Float    // positivo; INCOME o EXPENSE determina el signo semántico
  type        String   @default("EXPENSE")  // "INCOME" | "EXPENSE"
  description String?
  date        DateTime
  categoryId  String
  category    Category @relation(...)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
