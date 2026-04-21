# redsocial monorepo

Proyecto con dos apps:

- `app/`: app movil Expo + Expo Router.
- `b2b-web/`: panel web Next.js para gestion de clubes.

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto Supabase con variables publicas configuradas

## Variables de entorno

### app movil (`.env` en raiz)

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### b2b-web (`b2b-web/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Como correr todo

1. Instalar dependencias de web:

```bash
cd b2b-web && npm install
```

2. Instalar dependencias de movil:

```bash
cd .. && npm install
```

3. Levantar web:

```bash
cd b2b-web && npm run dev
```

4. Levantar movil:

```bash
cd .. && npm run start
```

## SQL base recomendado

Ejecutar en Supabase SQL Editor:

- `supabase/migrations/001_auth_sync_and_club_policies.sql`
- `supabase/migrations/002_inventory_audit_logs.sql`
- `supabase/migrations/003_smoke_spots.sql`
- `supabase/migrations/004_smoke_spot_votes.sql`

Esto asegura:

- Sync de `auth.users` hacia `public.profiles` y `public.users`.
- Politicas RLS para `public.clubs`.
- Tabla de auditoria `inventory_audit_logs` con RLS por club owner.
- Tabla comunitaria `smoke_spots` para mapa de spots recomendados.
- Tabla `smoke_spot_votes` para votos comunitarios de spots.

## Storage recomendado

- Bucket: `club-media` (para portada/logo de club).
- En onboarding/settings se puede usar URL manual o subida de archivo.

## Flujo rapido de prueba

1. Crear cuenta en B2B.
2. Completar onboarding del club con direccion valida.
3. Verificar club en dashboard y settings.
4. Verificar club en app movil (home/map).
