-- Structure attendue par Atlas GOTRM v1.0, déjà créée dans Supabase.
-- Ne pas réexécuter si la table player_progress et les trois politiques RLS existent.
create table if not exists public.player_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.player_progress enable row level security;
-- Les politiques select/insert/update limitées à auth.uid() doivent être présentes.
