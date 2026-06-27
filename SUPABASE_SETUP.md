# Supabase Setup For Higher Maths App

This app works in guest mode with AsyncStorage. Supabase is used when a user creates an account so their practice progress, lesson rewards, coins, and garden can sync across devices.

## 1. Create A Supabase Project

1. Go to [supabase.com](https://supabase.com).
2. Create a new project.
3. Go to **Project Settings > API**.
4. Copy:
   - **Project URL**
   - **anon public** key

Create `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

For Vercel, add the same two variables in **Project Settings > Environment Variables**.

## 2. Enable Email Auth

In Supabase:

1. Go to **Authentication > Providers**.
2. Enable **Email**.
3. Choose whether email confirmation is required.

Then go to **Authentication > URL Configuration** and add your URLs.

For local Expo web:

```text
http://localhost:8081
http://localhost:8081/*
```

For Vercel:

```text
https://your-project.vercel.app
https://your-project.vercel.app/*
```

For a custom domain:

```text
https://your-domain.com
https://your-domain.com/*
```

## 3. Create Database Tables

Open **SQL Editor** in Supabase and run this whole script.

```sql
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_garden (
  user_id uuid primary key references auth.users(id) on delete cascade,
  garden jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  question_id text not null,
  answer_given text not null,
  is_correct boolean not null,
  answered_at timestamptz not null
);

create index if not exists practice_attempts_user_id_idx
  on public.practice_attempts(user_id);

create index if not exists practice_attempts_topic_id_idx
  on public.practice_attempts(topic_id);

create index if not exists practice_attempts_answered_at_idx
  on public.practice_attempts(answered_at desc);
```

## 4. Enable Row Level Security

Run this after the tables are created.

```sql
alter table public.user_progress enable row level security;
alter table public.user_garden enable row level security;
alter table public.practice_attempts enable row level security;
```

## 5. Add RLS Policies

These policies mean users can only read/write their own rows.

```sql
drop policy if exists "Users can read their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

create policy "Users can read their own progress"
on public.user_progress
for select
using (auth.uid() = user_id);

create policy "Users can insert their own progress"
on public.user_progress
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.user_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own garden" on public.user_garden;
drop policy if exists "Users can insert their own garden" on public.user_garden;
drop policy if exists "Users can update their own garden" on public.user_garden;

create policy "Users can read their own garden"
on public.user_garden
for select
using (auth.uid() = user_id);

create policy "Users can insert their own garden"
on public.user_garden
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own garden"
on public.user_garden
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own attempts" on public.practice_attempts;
drop policy if exists "Users can insert their own attempts" on public.practice_attempts;

create policy "Users can read their own attempts"
on public.practice_attempts
for select
using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
on public.practice_attempts
for insert
with check (auth.uid() = user_id);
```

## 6. What The App Syncs

The Supabase client is in `lib/supabase.ts`.

The sync code is in `lib/storage.ts`.

Supabase tables:

- `user_progress`: topic progress totals, correct/incorrect counts, and last-practised times.
- `practice_attempts`: one row for each answered practice question.
- `user_garden`: coins, plants, plant growth, and rewarded lesson IDs.

When a user logs in or creates an account, the app runs `syncSignedInUserState`. That merges local guest progress with Supabase state.

After that:

- Completing practice updates `user_progress`, inserts into `practice_attempts`, and awards synced coins.
- Completing lessons updates `user_garden` through `rewardedLessonIds` and coin balance.
- Buying plants and watering plants update `user_garden`.

## 7. Deploy On Vercel

Use these Vercel settings:

```text
Build Command: npx expo export --platform web
Output Directory: dist
```

Environment variables:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

After deploying, visit:

```text
https://your-project.vercel.app/manifest.webmanifest
https://your-project.vercel.app/sw.js
```

Both should load. That confirms the PWA files were regenerated into `dist`.

## 8. Test The Full Flow

1. Run the app.

```bash
npm run start
```

2. Open the Account tab.
3. Create an account or log in.
4. Complete a lesson.
5. Answer a practice question.
6. Go to the Garden tab.
7. Buy a plant.
8. Water a plant.

In Supabase, check:

- **Table Editor > user_progress** has one row for your user.
- **Table Editor > practice_attempts** has a row for the answered question.
- **Table Editor > user_garden** has coins, plants, water counts, and rewarded lesson IDs.

To test cross-device sync:

1. Log in on one device.
2. Earn coins and plant something.
3. Log in with the same account on another device/browser.
4. The garden and progress should load from Supabase.

## 9. Reset A Test User

Use this only for your own testing.

```sql
delete from public.practice_attempts
where user_id = 'USER_UUID_HERE';

delete from public.user_progress
where user_id = 'USER_UUID_HERE';

delete from public.user_garden
where user_id = 'USER_UUID_HERE';
```

You can find the user UUID in **Authentication > Users**.
