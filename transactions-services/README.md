# transactions-service 💳

Microservicio del monorepo **Centavo** para el registro y categorización de transacciones financieras (ingresos y gastos).

---

## Requisitos

- Node.js ≥ 20
- npm ≥ 10

---

## Instalación

```bash
cd transactions-services

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Crear la base de datos y aplicar el schema
npm run db:push

# (Opcional) Cargar categorías predeterminadas
npm run db:seed
```

---

## Uso en desarrollo

```bash
npm run dev   # Servidor con hot-reload en http://localhost:3002
```

---

## API Endpoints

### Health check

```
GET /api/v1/health
```

```json
{ "status": "ok", "service": "transactions-service", "timestamp": "..." }
```

---

### Categorías — `/api/v1/categories`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `GET` | `/` | — | Listar todas las categorías |
| `POST` | `/` | `{ name, icon?, color? }` | Crear categoría |
| `GET` | `/:id` | — | Obtener categoría por ID |
| `PATCH` | `/:id` | `{ name?, icon?, color? }` | Actualizar parcialmente |
| `DELETE` | `/:id` | — | Eliminar categoría |

**Ejemplo — crear categoría:**

```bash
curl -X POST http://localhost:3002/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{ "name": "Alimentación", "icon": "🍔", "color": "#FF6B6B" }'
```

```json
{
  "status": "success",
  "data": {
    "id": "clxyz...",
    "name": "Alimentación",
    "icon": "🍔",
    "color": "#FF6B6B",
    "createdAt": "2024-03-15T12:00:00.000Z"
  }
}
```

---

### Transacciones — `/api/v1/transactions`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `POST` | `/` | `{ amount, type?, description?, date, categoryId }` | Crear transacción |
| `GET` | `/` | — | Listar (paginado y filtrable) |
| `GET` | `/:id` | — | Obtener transacción por ID |
| `PATCH` | `/:id` | campos opcionales | Actualizar parcialmente |
| `DELETE` | `/:id` | — | Eliminar transacción |

**Filtros disponibles en `GET /api/v1/transactions`:**

| Query param | Tipo | Descripción |
|-------------|------|-------------|
| `categoryId` | CUID | Filtrar por categoría |
| `type` | `INCOME` \| `EXPENSE` | Filtrar por tipo |
| `from` | ISO 8601 | Fecha inicial (inclusive) |
| `to` | ISO 8601 | Fecha final (inclusive) |
| `page` | número | Página (default: 1) |
| `limit` | número (máx 100) | Registros por página (default: 20) |

**Ejemplo — crear transacción:**

```bash
curl -X POST http://localhost:3002/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000,
    "type": "EXPENSE",
    "description": "Almuerzo en restaurante",
    "date": "2024-03-15T12:00:00.000Z",
    "categoryId": "clxyz..."
  }'
```

**Ejemplo — listar con filtros:**

```bash
curl "http://localhost:3002/api/v1/transactions?type=EXPENSE&from=2024-01-01T00:00:00Z&page=1&limit=10"
```

```json
{
  "status": "success",
  "data": [ "..." ],
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

## Tests

```bash
npm test              # Ejecutar todos los tests (CI)
npm run test:watch    # Modo watch
npm run test:coverage # Con reporte de cobertura
```

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor con hot-reload (tsx watch) |
| `npm run build` | Compilar TypeScript → `dist/` |
| `npm start` | Iniciar el servidor compilado |
| `npm run db:push` | Aplicar schema a la BD (dev, sin historial) |
| `npm run db:migrate` | Migración formal con historial |
| `npm run db:seed` | Cargar categorías predeterminadas |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm test` | Ejecutar tests con Vitest |

---

## Variables de entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `PORT` | No | `3002` | Puerto del servidor |
| `NODE_ENV` | No | `development` | Entorno de ejecución |
| `DATABASE_URL` | **Sí** | — | URL de conexión a la BD |

Para desarrollo local con SQLite:

```env
DATABASE_URL="file:./dev.db"
```

Para producción con PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/centavo_transactions?schema=public"
```

---

## Respuestas de error

Todos los errores siguen la forma:

```json
{ "status": "error", "message": "Descripción del error" }
```

Los errores de validación incluyen además `errors` con el detalle por campo:

```json
{
  "status": "error",
  "message": "Datos de entrada inválidos",
  "errors": { "amount": ["El monto debe ser mayor a 0"] }
}
```

| Código | Situación |
|--------|-----------|
| `400` | Validación fallida (Zod) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej: nombre de categoría duplicado) |
| `500` | Error interno del servidor |
