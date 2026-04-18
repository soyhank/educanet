# Setup de Supabase Storage

## Pasos (ejecutar una sola vez)

### 1. Crear bucket "certificados"
- Ir a Supabase Dashboard > Storage
- Click "New bucket"
- Name: `certificados`
- Public bucket: **NO** (privado)
- File size limit: 5MB
- Allowed mime types: `application/pdf`

### 2. Crear bucket "avatares"
- Click "New bucket"
- Name: `avatares`
- Public bucket: **SI**
- File size limit: 2MB
- Allowed mime types: `image/jpeg, image/png, image/webp`

### 3. Aplicar politicas de storage
- Ir a SQL Editor > New query
- Pegar el contenido de `supabase/storage-policies.sql`
- Ejecutar (Run)
- Verificar que diga "Success"
