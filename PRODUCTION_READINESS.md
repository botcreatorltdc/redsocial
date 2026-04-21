# Production Readiness Checklist

This repository contains two apps:

- `app/` (Expo React Native user app)
- `b2b-web/` (Next.js club dashboard)

## 1) Environment Variables

### Mobile app (`app/`)

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### B2B web (`b2b-web`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Supabase SQL Baseline

Apply:

- `supabase/migrations/001_auth_sync_and_club_policies.sql`

This sets:

- `clubs` RLS policies for owner select/insert/update
- trigger to sync `auth.users -> public.profiles`
- trigger to sync `auth.users -> public.users`

## 3) Auth Settings

For production:

- Enable email confirmation
- Use realistic Auth rate limits
- Configure a proper email provider

For testing:

- You can temporarily disable email confirmation
- Increase email rate limit to avoid `429 email rate limit exceeded`

## 4) Deployment Checks

### B2B web

- `cd b2b-web && npm run build` must pass
- Vercel project root must point to `b2b-web`

### Mobile app

- `npm run typecheck` must pass
- `npm run web` should bundle correctly
- Generate Android build via EAS/APK process

## 5) Data Model Consistency

- Keep user identity synced in:
  - `auth.users`
  - `public.users`
  - `public.profiles`
- `public.clubs.owner_id` must match authenticated owner user id.

## 6) Operational Smoke Test

1. Register a new club account
2. Login successfully
3. Create club on onboarding
4. Reach `/dashboard` and navigate to:
   - `/dashboard/inventory`
   - `/dashboard/settings`
5. Logout and login again; ensure no onboarding loop
