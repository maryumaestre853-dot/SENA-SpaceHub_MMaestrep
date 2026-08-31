# SENA SpaceHub (TypeScript + PostgreSQL)

Proyecto **completo**: los 4 módulos (**Dashboard, Inventario, Préstamos,
Ticketera de Incidencias**) migrados a `.tsx` con interfaces TypeScript, Auth
+ RBAC funcional, y el script completo de base de datos en PostgreSQL. Todos
los módulos comparten la misma fuente de datos (`DataContext`), así que las
barras y KPIs del Dashboard se actualizan solos cuando agregas un equipo,
registras un préstamo o resuelves un ticket en cualquier otro módulo.

## Cómo correr el frontend

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Ya arranca con la Aprendiz **Ana María Fajardo**
logueada (botón "Salir" arriba a la derecha). Prueba el botón **Iniciar
Sesión** para cambiar entre el rol **Aprendiz** y **Administrador/Operario** y
navega entre las 4 pestañas del header para ver cómo cambian los permisos:

- **Inventario**: todos pueden ver los equipos; solo Administrador/Instructor
  pueden agregar uno nuevo o cambiar su estado.
- **Préstamos**: como Aprendiz, "Aprendiz" y "Ficha" quedan bloqueados y
  autocompletados desde tu sesión. Como Administrador, esos campos quedan
  libres para asignar un equipo a cualquier aprendiz.
- **Ticketera**: cualquier rol puede reportar una falla; solo
  Administrador/Instructor pueden marcarla como resuelta.

## Cómo montar la base de datos (PostgreSQL)

```bash
createdb sena_spacehub
psql -d sena_spacehub -f database/schema.sql
```

El script fue probado en PostgreSQL 16 y corre sin errores. Contraseña de
prueba para todos los usuarios sembrados: `123456` (se guarda con `crypt()` /
`pgcrypto`, nunca en texto plano).

Para comprobar que las vistas calculan los mismos números que ves en el
Dashboard:

```sql
SELECT * FROM vista_ocupacion_ambientes;
SELECT * FROM vista_dashboard_kpis;
SELECT * FROM vista_prestamos_por_dia;
```

## Estructura de carpetas

```
sena-spacehub/
├── database/
│   └── schema.sql              <- 6 tablas + vistas + datos de ejemplo
├── src/
│   ├── types/
│   │   └── spacehub.types.ts   <- interfaces, espejo 1:1 de las tablas SQL
│   ├── context/
│   │   ├── AuthContext.tsx     <- estado global de sesion (login/logout/roles)
│   │   └── DataContext.tsx     <- equipos/prestamos/incidencias + CRUD (fuente única de verdad)
│   ├── data/
│   │   └── mockData.ts         <- simula "SELECT * FROM ..." (reemplazar por fetch a tu API)
│   ├── hooks/
│   │   └── useDashboardStats.ts<- calcula TODOS los KPIs y % de las barras
│   ├── components/
│   │   ├── SenaHeader.tsx      <- navegación entre los 4 módulos + contadores en vivo
│   │   ├── RoleInfoBanner.tsx
│   │   ├── LoginModal.tsx
│   │   └── MainLayout.tsx      <- decide qué módulo se ve (useState moduloActivo)
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── EquiposPage.tsx     <- Inventario (alta + cambio de estado, solo Admin/Instructor)
│   │   ├── PrestamosPage.tsx   <- Préstamos con RBAC (autocompletado Aprendiz vs libre Operario)
│   │   └── IncidenciasPage.tsx <- Ticketera (reporte abierto, resolución solo Admin/Instructor)
│   ├── App.tsx
│   └── main.tsx
└── README.md
```

## Por que las barras "se mueven con coherencia"

Ningun porcentaje esta escrito a mano. Hay **una sola fuente de verdad**
(los arreglos `equiposIniciales` / `prestamosIniciales` / `incidenciasIniciales`
en `src/data/mockData.ts`) y **dos capas que calculan lo mismo**:

1. **Frontend** — `src/hooks/useDashboardStats.ts` recorre esos arreglos con
   `useMemo` y produce `kpis`, `ocupacionPorAmbiente` y `prestamosPorDia`.
2. **Base de datos** — `vista_ocupacion_ambientes`, `vista_dashboard_kpis` y
   `vista_prestamos_por_dia` en `database/schema.sql` hacen exactamente el
   mismo calculo con `JOIN` + `COUNT` + `FILTER`.

Lo comprobamos: con los mismos datos semilla, ambas capas devuelven
**301 -> 100%, 302 -> 50%, 303 -> 0%, ocupacion promedio -> 50%**. Cuando conectes
el CRUD de Inventario/Prestamos (siguiente entrega) a una API real sobre esta
base de datos, solo cambias `mockData.ts` por `fetch()` — ni las interfaces ni
las formulas cambian, y las barras seguiran moviendose solas.

## Siguiente entrega (lo único que falta de verdad)

Todo el frontend con datos simulados ya está completo. Lo que queda para que
esto sea un sistema real es una **capa de API** (Node/Express o similar) que
reemplace `src/data/mockData.ts` por consultas reales contra este mismo
`database/schema.sql`. Como `DataContext.tsx` ya centraliza toda la escritura
(`agregarEquipo`, `registrarPrestamo`, `resolverIncidencia`, etc.) con un
comentario `// En producción: ...` justo encima de cada `setState`, conectar
el backend es cambiar esas líneas por `fetch()` — ni las interfaces de
`spacehub.types.ts` ni los componentes que las consumen cambian.
