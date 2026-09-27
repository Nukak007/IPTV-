# Centavo Frontend | Dashboard Financiero

Scaffold moderno y modular para la plataforma de finanzas personales **Centavo**, desarrollado con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS**.

---

## 🚀 Inicio Rápido

Para ejecutar el proyecto en tu entorno local:

```powershell
# 1. Navegar al directorio del proyecto:
cd "C:\Users\alexa\.gemini\antigravity\scratch\centavo-frontend"

# 2. Iniciar el servidor de desarrollo Vite:
npm run dev
```

Luego abre en tu navegador la URL indicada (por defecto `http://localhost:5173`).

---

## 📱 Pantallas y Características

### 1. Pantalla de Autenticación (Login)
- **Branding Centavo**: Logotipo en gradiente esmeralda, propuesta de valor y sellos de seguridad SSL.
- **Formulario de Acceso**: Validación de campos de correo electrónico y contraseña con toggle de visibilidad (mostrar/ocultar).
- **Acceso Rápido Demo (1 Clic)**: Permite ingresar directamente al Dashboard con un usuario preconfigurado (`Alex González`).
- **Persistencia de Sesión**: Guarda el estado de autenticación en `localStorage` (`centavo_user`).

### 2. Pantalla Principal (Dashboard)
- **Barra de Navegación (Navbar)**: Identificador de marca, estado de conexión segura, campana de notificaciones, avatar de perfil y botón para cerrar sesión.
- **Métricas Financieras (KPI Cards)**:
  - Balance Total (patrimonio líquido).
  - Ingresos del Mes.
  - Gastos del Mes.
  - Tasa de Ahorro acumulada (%).
- **Listado de Transacciones**:
  - **Estado Vacío (Empty State)**: Ilustración amigable de recibo/monedero, textos explicativos de inducción y botón destacado *"Registrar mi primer movimiento"*.
  - **Buscador y Filtros**: Búsqueda en vivo por concepto/categoría y filtro por tipo (*Todas*, *Ingresos*, *Gastos*).
  - **Botón de Pruebas**: Permite cargar transacciones de muestra para probar la visualización en tabla y vaciarla en cualquier momento para volver al estado inicial.
  - **Modal de Nueva Transacción**: Formulario para registrar conceptos, montos, tipos y categorías con actualización inmediata de métricas.

---

## 🛠️ Estructura del Proyecto

```
src/
├── components/
│   ├── EmptyTransactions.tsx     # Componente de estado vacío cuando no hay movimientos
│   ├── MetricCard.tsx            # Tarjeta de KPI reutilizable con indicadores
│   ├── Navbar.tsx                # Barra de navegación superior con perfil de usuario
│   └── NewTransactionModal.tsx   # Modal para registrar nuevas transacciones
├── context/
│   └── AuthContext.tsx           # Contexto de autenticación, demo login y persistencia
├── pages/
│   ├── Dashboard.tsx             # Pantalla principal con KPIs y listado de transacciones
│   └── Login.tsx                 # Pantalla de inicio de sesión
├── types/
│   └── index.ts                  # Definición de tipos TypeScript (User, Transaction, etc.)
├── App.tsx                       # Conmutador de vistas según estado de autenticación
├── index.css                     # Directivas Tailwind CSS y estilos base
└── main.tsx                      # Punto de entrada de la aplicación
```

---

## 📦 Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con recarga rápida (HMR).
- `npm run build`: Compila TypeScript y genera el bundle optimizado para producción en `dist/`.
- `npm run preview`: Previsualiza la versión compilada de producción localmente.

