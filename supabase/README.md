# Supabase setup (Screen Time Scorer)

## 1. Create a project

1. Create a project at [supabase.com](https://supabase.com).
2. Auth → Providers → Email: enable email/password.
3. Project Settings → API: copy **Project URL** and **anon public** key.
4. Put them in a local `.env` (never commit):

```bash
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 2. Profile table (optional MVP)

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  entitlement_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

## 3. Account deletion Edge Function

The app calls `supabase.functions.invoke('delete-account')`. Deploy a function that:

1. Verifies the caller JWT.
2. Uses the **service role** key to delete the auth user (`auth.admin.deleteUser`).
3. Cascades profile / score history / device rows (FK `on delete cascade` preferred).
4. Marks or cancels billing entitlement via RevenueCat when that lands.

Scaffold stub: `supabase/functions/delete-account/index.ts`.

Until the function is deployed, Delete account signs the user out and shows setup guidance.
