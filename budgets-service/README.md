# budgets-service 📊

Microservicio del monorepo **Centavo** para la definición, consulta y administración de presupuestos por categoría y periodo.

---

## Requisitos

- Node.js ≥ 20
- npm ≥ 10

---

## Instalación

```bash
cd budgets-service

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Crear la base de datos y sincronizar el schema
npm run db:push
```

---

## Uso en desarrollo

```bash
npm run dev   # Servidor con hot-reload en http://localhost:3003
```

---

## API Endpoints

### Health check

```
GET /api/v1/health
```

```json
{
  "status": "ok",
  "service": "budgets-service",
  "timestamp": "2026-09-18T18:00:00.000Z"
}
```

---

### Presupuestos — `/api/v1/budgets`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `POST` | `/` | `{ category, limitAmount, period?, startDate?, endDate? }` | Crear presupuesto |
| `GET` | `/` | — | Listar presupuestos (con soporte para `?category=&period=&page=&limit=`) |
| `GET` | `/:id` | — | Obtener presupuesto por ID |
| `PATCH` | `/:id` | `{ category?, limitAmount?, period?, startDate?, endDate? }` | Actualizar parcialmente |
| `DELETE` | `/:id` | — | Eliminar presupuesto |

#### Ejemplo: Crear un presupuesto

```bash
curl -X POST http://localhost:3003/api/v1/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Alimentación",
    "limitAmount": 450.00,
    "period": "MONTHLY"
  }'
```

Respuesta (`201 Created`):

```json
{
  "status": "success",
  "data": {
    "id": "cm1abcdef000001...",
    "category": "Alimentación",
    "limitAmount": 450,
    "period": "MONTHLY",
    "startDate": null,
    "endDate": null,
    "createdAt": "2026-09-18T18:00:00.000Z",
    "updatedAt": "2026-09-18T18:00:00.000Z"
  }
}
```

#### Ejemplo: Consultar presupuestos

```bash
curl "http://localhost:3003/api/v1/budgets?category=Alimentación&period=MONTHLY"
```

Respuesta (`200 OK`):

```json
{
  "status": "success",
  "data": [
    {
      "id": "cm1abcdef000001...",
      "category": "Alimentación",
      "limitAmount": 450,
      "period": "MONTHLY",
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-09-18T18:00:00.000Z",
      "updatedAt": "2026-09-18T18:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Tests

```bash
npm run test        # Ejecutar suite de pruebas con Vitest
npm run test:watch  # Modo interactivo / observador
```

---

## Build y Producción

```bash
npm run build       # Compila a dist/
npm run start       # Ejecuta dist/server.js
```
