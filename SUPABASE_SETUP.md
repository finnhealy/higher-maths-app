# Supabase Setup

This app works in guest mode without Supabase, but login and cloud syncing need a Supabase project.

## 1. Create The Project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Open **Project Settings > API**.
3. Copy:
   - `Project URL`
   - `anon public` key

Create a local `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart Expo after changing env vars.

## 2. Enable Auth

In Supabase, go to **Authentication > Providers > Email** and enable email/password auth.

For local web testing, add these redirect URLs in **Authentication > URL Configuration**:

```text
http://localhost:8081
http://localhost:8081/*
```

For production, also add your deployed site URL:

```text
https://your-domain.com
https://your-domain.com/*
```

## 3. Create Tables

Open **SQL Editor** in Supabase and run:

```sql
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
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
```

## 4. Add Row Level Security

Run this after creating the tables:

```sql
alter table public.user_progress enable row level security;
alter table public.practice_attempts enable row level security;

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

create policy "Users can read their own attempts"
on public.practice_attempts
for select
using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
on public.practice_attempts
for insert
with check (auth.uid() = user_id);
```

## 5. How Sync Works In This App

The Supabase client lives in `lib/supabase.ts`.

The app currently syncs:

- `user_progress`: topic progress totals from `saveProgress`.
- `practice_attempts`: each answered practice question from `recordAttempt`.

The app stores locally with AsyncStorage first, so guest mode and offline progress still work. If a user is logged in and the env vars are present, the same progress is also written to Supabase.

## 6. Test It

Start the app:

```bash
npm run start
```

Then:

1. Open the Account tab.
2. Sign up with an email and password.
3. Complete a practice question.
4. In Supabase, check **Table Editor > practice_attempts** and **user_progress**.

If login says Supabase is not configured, check the `.env` variable names and restart Expo.
