-- ============================================================================
-- SENA SPACEHUB — SCRIPT DE BASE DE DATOS (PostgreSQL)
-- ============================================================================
-- Cómo usarlo:
--   1) createdb sena_spacehub
--   2) psql -d sena_spacehub -f schema.sql
--
-- Contiene:
--   - Tabla de autenticación con roles: usuarios          (1)
--   - + 5 tablas de negocio: ambientes, equipos, prestamos,
--     incidencias, sesiones_auditoria                      (5)
--   - 2 VISTAS que calculan los KPIs y % de ocupación del Dashboard
--     EN VIVO (sin números fijos) — el mismo cálculo que hace
--     src/hooks/useDashboardStats.ts en el frontend.
--   - Datos de ejemplo (seed) que coinciden con src/data/mockData.ts
-- ============================================================================

BEGIN;

-- Extensión para generar hashes de contraseña de forma segura (pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1) TABLA: usuarios  (autenticación + roles)
-- ============================================================================
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
    id               SERIAL PRIMARY KEY,
    nombre_completo  VARCHAR(150)  NOT NULL,
    correo           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash    VARCHAR(255)  NOT NULL,          -- NUNCA guardar la contraseña en texto plano
    rol              VARCHAR(20)   NOT NULL
                       CHECK (rol IN ('Aprendiz', 'Instructor', 'Administrador')),
    ficha            VARCHAR(20),                      -- obligatoria por lógica de negocio si rol = 'Aprendiz'
    creado_en        TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT chk_ficha_aprendiz
        CHECK (rol <> 'Aprendiz' OR ficha IS NOT NULL)
);

CREATE INDEX idx_usuarios_correo ON usuarios (correo);
CREATE INDEX idx_usuarios_rol    ON usuarios (rol);

-- ============================================================================
-- 2) TABLA: ambientes  (laboratorios de cómputo)
-- ============================================================================
DROP TABLE IF EXISTS ambientes CASCADE;
CREATE TABLE ambientes (
    id                 SERIAL PRIMARY KEY,
    codigo             VARCHAR(10)  NOT NULL UNIQUE,   -- ej. '301'
    nombre             VARCHAR(120) NOT NULL,           -- ej. 'Desarrollo Web (ADSO)'
    capacidad_equipos  INTEGER      NOT NULL DEFAULT 0
);

-- ============================================================================
-- 3) TABLA: equipos  (inventario de cómputo)
-- ============================================================================
DROP TABLE IF EXISTS equipos CASCADE;
CREATE TABLE equipos (
    id            SERIAL PRIMARY KEY,
    placa_sena    VARCHAR(30)  NOT NULL UNIQUE,
    marca_modelo  VARCHAR(120) NOT NULL,
    ram           VARCHAR(30)  NOT NULL,
    estado        VARCHAR(20)  NOT NULL DEFAULT 'Operativo'
                    CHECK (estado IN ('Operativo', 'En Mantenimiento', 'De Baja')),
    ambiente_id   INTEGER      NOT NULL REFERENCES ambientes (id) ON DELETE RESTRICT,
    creado_en     TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipos_ambiente ON equipos (ambiente_id);
CREATE INDEX idx_equipos_estado   ON equipos (estado);

-- ============================================================================
-- 4) TABLA: prestamos  (RBAC: aprendiz autoservicio vs. operario gestiona)
-- ============================================================================
DROP TABLE IF EXISTS prestamos CASCADE;
CREATE TABLE prestamos (
    id                     SERIAL PRIMARY KEY,
    usuario_id             INTEGER   NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,  -- aprendiz solicitante
    equipo_id              INTEGER   NOT NULL REFERENCES equipos  (id) ON DELETE RESTRICT,
    creado_por_usuario_id  INTEGER   NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT, -- quién lo registró
    hora_inicio            TIMESTAMP NOT NULL DEFAULT now(),
    hora_fin               TIMESTAMP,
    estado                 VARCHAR(20) NOT NULL DEFAULT 'Activo'
                             CHECK (estado IN ('Activo', 'Devuelto')),

    CONSTRAINT chk_devuelto_tiene_hora_fin
        CHECK (estado <> 'Devuelto' OR hora_fin IS NOT NULL)
);

CREATE INDEX idx_prestamos_usuario ON prestamos (usuario_id);
CREATE INDEX idx_prestamos_equipo  ON prestamos (equipo_id);
CREATE INDEX idx_prestamos_estado  ON prestamos (estado);
CREATE INDEX idx_prestamos_fecha   ON prestamos ((hora_inicio::date));

-- Un mismo equipo no puede tener dos préstamos "Activo" a la vez
CREATE UNIQUE INDEX idx_equipo_un_solo_prestamo_activo
    ON prestamos (equipo_id)
    WHERE estado = 'Activo';

-- ============================================================================
-- 5) TABLA: incidencias  (mesa de ayuda / ticketera)
-- ============================================================================
DROP TABLE IF EXISTS incidencias CASCADE;
CREATE TABLE incidencias (
    id                        SERIAL PRIMARY KEY,
    equipo_id                 INTEGER     NOT NULL REFERENCES equipos  (id) ON DELETE CASCADE,
    reportado_por_usuario_id  INTEGER     NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
    descripcion               TEXT        NOT NULL,
    prioridad                 VARCHAR(10) NOT NULL
                                CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    resuelta                  BOOLEAN     NOT NULL DEFAULT false,
    fecha_reporte              TIMESTAMP   NOT NULL DEFAULT now(),
    fecha_resolucion           TIMESTAMP
);

CREATE INDEX idx_incidencias_equipo    ON incidencias (equipo_id);
CREATE INDEX idx_incidencias_resuelta  ON incidencias (resuelta);

-- ============================================================================
-- 6) TABLA: sesiones_auditoria  (registro de logins, soporta el AuthContext)
-- ============================================================================
DROP TABLE IF EXISTS sesiones_auditoria CASCADE;
CREATE TABLE sesiones_auditoria (
    id            SERIAL PRIMARY KEY,
    usuario_id    INTEGER   NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    fecha_login   TIMESTAMP NOT NULL DEFAULT now(),
    fecha_logout  TIMESTAMP,
    ip_origen     VARCHAR(45)
);

CREATE INDEX idx_sesiones_usuario ON sesiones_auditoria (usuario_id);

-- ============================================================================
-- VISTAS — cálculo EN VIVO de los indicadores del Dashboard (nada "quemado")
-- Equivalente exacto al hook src/hooks/useDashboardStats.ts del frontend.
-- ============================================================================

-- Ocupación por ambiente: % de equipos de ese laboratorio con préstamo activo
CREATE OR REPLACE VIEW vista_ocupacion_ambientes AS
SELECT
    a.id                                                              AS ambiente_id,
    a.codigo,
    a.nombre,
    COUNT(e.id)                                                       AS total_equipos,
    COUNT(p.id) FILTER (WHERE p.estado = 'Activo')                    AS equipos_en_prestamo,
    ROUND(
        COALESCE(
            COUNT(p.id) FILTER (WHERE p.estado = 'Activo')::numeric
                / NULLIF(COUNT(e.id), 0) * 100,
            0
        ), 1
    )                                                                  AS porcentaje_ocupacion
FROM ambientes a
LEFT JOIN equipos   e ON e.ambiente_id = a.id
LEFT JOIN prestamos p ON p.equipo_id = e.id AND p.estado = 'Activo'
GROUP BY a.id, a.codigo, a.nombre
ORDER BY a.codigo;

-- KPIs generales del panel principal
CREATE OR REPLACE VIEW vista_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM equipos)                                                   AS total_equipos,
    (SELECT COUNT(*) FROM equipos WHERE estado = 'Operativo')                        AS equipos_operativos,
    (SELECT COUNT(*) FROM equipos WHERE estado = 'En Mantenimiento')                 AS equipos_mantenimiento,
    (SELECT COUNT(*) FROM prestamos WHERE estado = 'Activo')                         AS prestamos_activos,
    (SELECT COUNT(*) FROM incidencias WHERE resuelta = false)                        AS incidencias_pendientes,
    (SELECT COUNT(*) FROM incidencias WHERE resuelta = false AND prioridad = 'Alta') AS incidencias_alta,
    (SELECT ROUND(AVG(porcentaje_ocupacion), 1) FROM vista_ocupacion_ambientes)      AS ocupacion_promedio;

-- Préstamos agrupados por día (para la gráfica de barras semanal)
CREATE OR REPLACE VIEW vista_prestamos_por_dia AS
SELECT
    TO_CHAR(hora_inicio, 'Dy')  AS dia_abreviado,
    hora_inicio::date           AS fecha,
    COUNT(*)                    AS cantidad
FROM prestamos
GROUP BY hora_inicio::date, TO_CHAR(hora_inicio, 'Dy')
ORDER BY fecha;

-- ============================================================================
-- SEED DATA — coincide con src/data/mockData.ts para que frontend y BD
-- muestren los mismos números al conectar la API.
-- ============================================================================

-- Usuarios (password de prueba para TODOS: "123456")
INSERT INTO usuarios (nombre_completo, correo, password_hash, rol, ficha) VALUES
    ('Ana María Fajardo',      'ana.fajardo@sena.edu.co',    crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879451'),
    ('Ing. Roberto Gómez',     'roberto.gomez@sena.edu.co',  crypt('123456', gen_salt('bf')), 'Administrador', 'STAFF-TI'),
    ('Carlos Mendoza',         'carlos.mendoza@sena.edu.co', crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879451'),
    ('Jennifer Andrea',        'jennifer.andrea@sena.edu.co',crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879432'),
    ('Luis Fernando Rico',     'luis.rico@sena.edu.co',      crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879410'),
    ('Marcela Ortiz',          'marcela.ortiz@sena.edu.co',  crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879455'),
    ('Diego Salazar',          'diego.salazar@sena.edu.co',  crypt('123456', gen_salt('bf')), 'Instructor',    NULL),
    ('Paula Beltrán',          'paula.beltran@sena.edu.co',  crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879470'),
    ('Sara Gómez',             'sara.gomez@sena.edu.co',     crypt('123456', gen_salt('bf')), 'Aprendiz',      '2879480');

-- Ambientes (laboratorios)
INSERT INTO ambientes (codigo, nombre, capacidad_equipos) VALUES
    ('301', 'Desarrollo Web (ADSO)',       5),
    ('302', 'Redes y Bases de Datos',      4),
    ('303', 'Mantenimiento Hardware',      3);

-- Equipos
INSERT INTO equipos (placa_sena, marca_modelo, ram, estado, ambiente_id) VALUES
    ('SENA-1001', 'Lenovo ThinkPad L14 G3', '16GB DDR4', 'Operativo',        1),
    ('SENA-1002', 'HP ProBook 440 G8',      '16GB DDR4', 'En Mantenimiento', 2),
    ('SENA-1003', 'Dell Latitude 3420',     '32GB DDR5', 'Operativo',        1),
    ('SENA-1004', 'Lenovo ThinkPad L14 G3', '16GB DDR4', 'Operativo',        2),
    ('SENA-1005', 'ASUS ExpertBook P2',     '8GB DDR4',  'Operativo',        3);

-- Préstamos (algunos activos, otros ya devueltos durante la semana)
INSERT INTO prestamos (usuario_id, equipo_id, creado_por_usuario_id, hora_inicio, hora_fin, estado) VALUES
    (1, 1, 1, '2026-08-19 08:00', NULL,                  'Activo'),
    (3, 3, 3, '2026-08-19 09:30', NULL,                  'Activo'),
    (4, 4, 2, '2026-08-19 10:15', NULL,                  'Activo'),
    (5, 5, 5, '2026-08-17 07:45', '2026-08-17 16:00',    'Devuelto'),
    (6, 2, 6, '2026-08-17 08:20', '2026-08-17 17:10',    'Devuelto'),
    (1, 3, 1, '2026-08-18 09:00', '2026-08-18 15:30',    'Devuelto'),
    (7, 4, 7, '2026-08-18 10:00', '2026-08-18 16:45',    'Devuelto'),
    (8, 1, 8, '2026-08-18 11:00', '2026-08-18 17:00',    'Devuelto');

-- Incidencias pendientes
INSERT INTO incidencias (equipo_id, reportado_por_usuario_id, descripcion, prioridad, resuelta) VALUES
    (2, 2, 'Falla en el teclado y puerto HDMI intermitente', 'Alta',  false),
    (5, 2, 'Batería no retiene carga más de 30 minutos',     'Media', false);

COMMIT;

-- ============================================================================
-- CONSULTAS DE VERIFICACIÓN (opcional, ejecútalas para probar las vistas)
-- ============================================================================
-- SELECT * FROM vista_ocupacion_ambientes;
-- SELECT * FROM vista_dashboard_kpis;
-- SELECT * FROM vista_prestamos_por_dia;
