# Educanet

Plataforma interna de capacitacion y desarrollo de carrera. Combina cursos en video, gamificacion (puntos, badges, ranking), certificados descargables, metricas de desempeno y rutas de ascenso visualizadas.

## Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Lenguaje:** TypeScript (modo estricto)
- **Estilos:** Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **ORM:** Prisma
- **Video:** Bunny Stream
- **Emails:** Resend
- **Certificados:** @react-pdf/renderer
- **Testing:** Vitest + Testing Library

## Setup local

```bash
# 1. Clonar el repositorio
git clone https://github.com/mkt-inge3d/educanet.git
cd educanet

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Generar el cliente de Prisma
npm run db:generate

# 5. Sincronizar el esquema con la base de datos
npm run db:push

# 6. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run lint` | Linter con ESLint |
| `npm run typecheck` | Verificacion de tipos |
| `npm run test` | Tests con Vitest |
| `npm run db:push` | Sincronizar esquema Prisma |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:migrate` | Crear migracion |

## Estructura del proyecto

```
app/
  (auth)/          -> Paginas de autenticacion (login, registro)
  (dashboard)/     -> Paginas del empleado (cursos, carrera, logros...)
  (admin)/         -> Panel de administracion
  api/webhooks/    -> Webhooks externos
  verificar/       -> Verificacion publica de certificados
components/
  ui/              -> Componentes shadcn/ui
  curso/           -> Componentes de cursos
  gamificacion/    -> Puntos, badges, rankings
  dashboard/       -> Componentes del dashboard
  admin/           -> Componentes de administracion
  shared/          -> Componentes compartidos
lib/
  supabase/        -> Clientes de Supabase (browser, server, middleware)
  gamificacion/    -> Logica de puntos y badges
  certificados/    -> Generacion de certificados PDF
  notificaciones/  -> Sistema de notificaciones
  emails/          -> Templates de email
prisma/            -> Schema y migraciones
types/             -> Tipos TypeScript compartidos
tests/             -> Tests
```

## Setup de autenticacion (una sola vez)

### 1. Aplicar SQL de sincronizacion Auth - User

- Abre `supabase/auth-sync.sql`
- Copia TODO el contenido (excepto el bloque final comentado de backfill)
- Pegalo en Supabase Dashboard - SQL Editor - New query
- Ejecuta (Run)
- Verifica que aparezca "Success. No rows returned"

### 2. Aplicar SQL de RLS policies

- Abre `supabase/rls-policies.sql`
- Copialo en SQL Editor y ejecuta
- Verifica que todas las tablas tengan RLS activo en Table Editor

### 3. Configurar Supabase Auth

- Authentication - Providers - Email habilitado
- Settings - Auth - Email confirmation: **OFF** en dev (ON en prod)
- Site URL: `http://localhost:3000`
- Redirect URLs: agregar `http://localhost:3000/**`

### 4. Crear los 5 usuarios iniciales

Ir a Authentication - Users - Add user (marcar "Auto Confirm User"):

| Email                         | Password     |
|-------------------------------|--------------|
| admin@educanet.local          | educanet2026 |
| jefe.marketing@educanet.local | educanet2026 |
| ana.garcia@educanet.local     | educanet2026 |
| carlos.lopez@educanet.local   | educanet2026 |
| maria.torres@educanet.local   | educanet2026 |

### 5. Asignar roles admin en user_metadata

En SQL Editor ejecutar:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"rol": "ADMIN"}'::jsonb
WHERE email IN ('admin@educanet.local', 'jefe.marketing@educanet.local');

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"rol": "TRABAJADOR"}'::jsonb
WHERE email IN ('ana.garcia@educanet.local', 'carlos.lopez@educanet.local', 'maria.torres@educanet.local');
```

### 6. Completar datos de los usuarios

```bash
npm run db:seed-post-auth
```

### 7. Probar login

```bash
npm run dev
# Ir a /login
# Login con admin@educanet.local / educanet2026
# Debe redirigir a /cursos
```

## Servicios externos

- [Supabase](https://supabase.com/docs) - Auth, PostgreSQL, Storage, RLS
- [Bunny Stream](https://docs.bunny.net/docs/stream-overview) - Video hosting y streaming
- [Resend](https://resend.com/docs) - Emails transaccionales

## Deploy

El proyecto se despliega automaticamente en Vercel al hacer push a `master`.
