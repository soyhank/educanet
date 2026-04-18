# Decisiones arquitectonicas de Educanet

## Stack
- **Next.js 16 con App Router**: Server Components por defecto, Server Actions para mutaciones, streaming con Suspense.
- **Prisma 7 + Supabase**: Prisma para queries tipadas y migraciones, Supabase para Auth, Storage y Realtime. RLS a nivel de base de datos.
- **shadcn/ui v4**: Usa @base-ui/react. Pattern `render={}` en lugar de `asChild`.

## Auth y seguridad
- Supabase Auth con trigger SQL que sincroniza auth.users -> tabla User de Prisma.
- Rol guardado en user_metadata del JWT para lectura rapida en middleware sin consultar DB.
- RLS aplicado en todas las tablas para seguridad a nivel de base de datos.

## Gamificacion
- Rankings sanos: por area, opt-in, mensajes motivacionales, nunca punitivos.
- Badges automaticos via evaluadores por tipo de criterio, idempotentes.
- Rachas tipo Duolingo con logica de dias consecutivos.

## Certificados
- PDF generado server-side con @react-pdf/renderer.
- Storage privado en Supabase con signed URLs de 5 minutos.
- Verificacion publica sin auth, datos minimos por privacidad.
- Codigo EDU-XXXX-XXXX-XXXX sin caracteres ambiguos.

## Emails
- Abstraccion con feature flag EMAIL_ENABLED.
- Modo mock loguea en consola para desarrollo.
- Fire-and-forget: errores de email no bloquean flujos principales.

## Video
- Bunny Stream externo. Video IDs se asignan manualmente.
- MockPlayer funcional para desarrollo sin credenciales.
- Abstraccion preparada para switchear a Bunny cuando haya credentials.

## Performance
- Server Components por defecto, Client solo para interactividad.
- Queries con Promise.all para paralelizar.
- Images con next/image para optimizacion automatica.
