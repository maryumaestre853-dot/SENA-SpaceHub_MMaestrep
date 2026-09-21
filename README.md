# SENA SpaceHub

Frontend en React + TypeScript + Vite para gestión de inventario de equipos.
Este README describe lo que la aplicación **realmente hace hoy**, no un plan
a futuro.

## Stack

- React 19 + TypeScript
- Vite 8
- React Router v7 (`BrowserRouter`)
- Tailwind CSS 3 (utilidades activas vía `@tailwind` en `src/index.css`)

## Cómo correr

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Otros comandos:

```bash
npm run build    # tsc -b && vite build
npm run preview  # sirve el build de dist/
npm run lint     # oxlint
```

## Qué existe hoy

- **Login simulado** (`/login`): se ingresa un correo y se elige un rol
  (Aprendiz / Instructor / Administrador). No valida contraseña ni consulta
  ningún backend — `AuthContext.loginSimulado` arma el usuario en el momento
  y lo guarda en `localStorage` (`spacehub_user`).
- **Shell protegido** (`MainLayout` + `SenaHeader`): todas las rutas salvo
  `/login` están detrás de `ProtectedRoute`, que redirige a `/login` si no
  hay sesión.
- **Dashboard** (`/dashboard`): KPIs de ejemplo, con valores **fijos en el
  código** (no se calculan a partir de datos reales todavía).
- **Inventario** (`/inventario`, `/inventario/:placaSena`,
  `/inventario/nuevo`): alta, detalle y listado de equipos, persistidos en
  `localStorage` (clave `equipos`). Crear un equipo nuevo requiere rol
  `Administrador`.
- **Perfil** (`/perfil`): datos del usuario en sesión.

## Limitaciones conocidas

- **No hay backend conectado.** Todo vive en `localStorage` del navegador;
  los datos no se comparten entre usuarios ni persisten si se limpia el
  sitio.
- **Auth simulada**, sin contraseñas reales ni servidor.
- **Dashboard con KPIs estáticos**, no derivados del inventario real.
- **No existen módulos de Préstamos ni Ticketera de Incidencias** en la app
  que corre hoy (se removieron restos de código roto/inalcanzable de un
  intento anterior). Si se necesitan, son una feature nueva a construir.
- `database/schema.sql` queda como referencia de un posible backend futuro
  en PostgreSQL, pero **nada en el frontend se conecta a una base de datos
  hoy**.

## Estructura de carpetas

```
sena-spacehub/
├── database/
│   └── schema.sql                        <- referencia para un futuro backend, no conectado
├── public/
├── src/
│   ├── context/
│   │   └── AuthContext.tsx               <- sesión simulada (login/logout/rol)
│   ├── routes/
│   │   └── ProtectedRoute.tsx            <- guard de rutas privadas + rol requerido
│   ├── layouts/
│   │   └── MainLayout/MainLayout.tsx     <- shell de la app (header + <Outlet />)
│   ├── components/
│   │   └── SenaHeader/SenaHeader.tsx     <- navegación + usuario en sesión
│   ├── pages/
│   │   ├── LoginPage/
│   │   ├── DashboardPage/
│   │   ├── EquiposPage/                  <- Inventario (listado)
│   │   ├── DetalleEquipoPage/
│   │   ├── NuevoEquipoPage/               <- solo Administrador
│   │   └── PerfilPage/
│   ├── App.tsx                            <- definición de rutas
│   └── main.tsx                           <- entry point
└── README.md
```
