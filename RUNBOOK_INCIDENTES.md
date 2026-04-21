# Runbook de incidentes comunes

## 409 Conflict al crear club

### Sintoma
- Error `409` en `POST /rest/v1/clubs`.

### Causa frecuente
- Ya existe un club para `owner_id` (unicidad).

### Acciones
1. Confirmar usuario autenticado y `owner_id`.
2. Verificar si ya existe un club:
   - `select id, owner_id from public.clubs where owner_id = '<auth_uid>';`
3. Si existe, usar update en lugar de crear uno nuevo.

## 403 Forbidden en signup o updates

### Sintoma
- Error `403` en operaciones sobre `profiles/users/clubs`.

### Causa frecuente
- RLS bloqueando por politica faltante o condicion invalida.

### Acciones
1. Revisar que RLS y politicas esten aplicadas.
2. Ejecutar migracion `001_auth_sync_and_club_policies.sql`.
3. Evitar inserts de perfil desde cliente no autorizado; usar triggers `auth.users -> public.*`.

## 429 Too Many Requests en signup

### Sintoma
- Error `email rate limit exceeded`.

### Causa frecuente
- Limites de email de Supabase Auth en testing.

### Acciones
1. Esperar cooldown.
2. Usar otro email en QA.
3. En entorno de pruebas, ajustar temporalmente rate limits / confirmacion de email.

## Checklist rapido post-incidente

- `auth.users` contiene el usuario nuevo.
- `public.users` contiene mismo `id`.
- `public.profiles` contiene mismo `id`.
- `public.clubs.owner_id` referencia un `id` existente en `public.users`.
