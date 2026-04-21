# Contrato de modelo de identidad

Objetivo: eliminar ambiguedad entre `auth.users`, `public.users` y `public.profiles`.

## Fuente de verdad

- `auth.users` = identidad y autenticacion (source of truth de usuario autenticado).
- `public.users` = perfil publico de dominio (email, nickname, preferencias, verificacion).
- `public.profiles` = datos ligeros para UX social (username, full_name, avatar).

## Reglas de sincronizacion

1. Nunca crear manualmente usuarios en `public.users/profiles` desde frontend durante signup.
2. Al crearse `auth.users`, triggers backend crean filas espejo en `public.users` y `public.profiles`.
3. Claves:
   - `auth.users.id` == `public.users.id` == `public.profiles.id`.

## Clubs

- `public.clubs.owner_id` debe referenciar `public.users.id`.
- Un owner puede tener como maximo un club (si se mantiene la restriccion de negocio).
- Coordenadas deben ser reales (no `0,0`) y derivadas de direccion validada.

## Lectura y escritura recomendada

- Auth: via Supabase Auth SDK.
- Perfil social: leer/escribir `public.profiles`.
- Perfil de dominio de usuario: leer/escribir `public.users`.
- Clubes: leer/escribir `public.clubs` con RLS por `owner_id = auth.uid()`.

## Anti-patrones a evitar

- Hacer `upsert` de perfiles en cliente justo tras `signUp` sin sesion valida.
- Mezclar `profiles` y `users` como si fuesen la misma entidad.
- Permitir creacion de club sin validar direccion + lat/lng.
