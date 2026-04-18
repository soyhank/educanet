# Changelog

## v0.1.0 — MVP (2026-04-18)

### Features
- Sistema de autenticacion con Supabase Auth (login, registro, reset password)
- Dashboard personalizado con stats, rachas, progreso
- Catalogo de cursos con filtros y busqueda
- Reproductor de lecciones (video mock, lectura markdown, quizzes interactivos)
- Sistema de notas por leccion
- Gamificacion completa: puntos, niveles, badges automaticos, rachas diarias, rankings por area
- Mi Carrera: visualizacion de ruta de crecimiento con progreso
- Desempeno: metricas con clasificacion y tendencia
- Certificados PDF con QR y verificacion publica
- Panel admin: gestion de cursos, usuarios, metricas, rutas, badges, analiticas
- Perfil del trabajador con avatar upload, seguridad, preferencias
- Busqueda global con Ctrl+K
- Pagina de induccion para nuevos empleados
- Sistema de notificaciones in-app
- Emails en modo mock (listo para Resend)
- Tema claro/oscuro
- Landing publica
- Health check endpoint

### Infraestructura
- Deploy en Vercel con CI/CD via GitHub Actions
- Supabase Storage para certificados, avatares, thumbnails
- Row Level Security en todas las tablas
- Security headers configurados
