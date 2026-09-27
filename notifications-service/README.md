# notifications-service 🔔

Microservicio independiente del monorepo **Centavo**, responsable de la generación de alertas de sobregasto, monitoreo de umbrales presupuestarios y gestión de notificaciones para el usuario.

## 🚀 Inicio Rápido

### 1. Requisitos previos
- Node.js ≥ 20
- npm ≥ 10

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Configuración de entorno
Copia el archivo `.env.example` como `.env`:
```bash
cp .env.example .env
```

### 4. Base de datos (Prisma con SQLite para desarrollo local)
```bash
npm run db:push
```

### 5. Iniciar en modo desarrollo
```bash
npm run dev
```
El servidor estará escuchando en `http://localhost:3004`.

---

## 🧪 Pruebas

Para ejecutar las pruebas automatizadas con Vitest:
```bash
npm test
```

---

## 📡 API Endpoints

- `GET /api/v1/health` — Health check
- `POST /api/v1/notifications/events/transaction` — Procesar evento de transacción para evaluación de sobregasto
- `GET /api/v1/notifications` — Listar notificaciones
- `GET /api/v1/notifications/:id` — Obtener detalle de notificación
- `PATCH /api/v1/notifications/:id/read` — Marcar notificación como leída
- `DELETE /api/v1/notifications/:id` — Eliminar notificación
