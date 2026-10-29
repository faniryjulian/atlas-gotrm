-- Exécuter dans Supabase > SQL Editor.
create table if not exists public.atlas_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb,
 revision bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.atlas_progress enable row level security;
create policy "read own progress" on public.atlas_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own progress" on public.atlas_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own progress" on public.atlas_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Optimistic locking via atomic RPC; prevents overwriting concurrent changes.
create or replace function public.atlas_save_progress(expected_revision bigint, new_data jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
 update public.atlas_progress set data = new_data, revision = revision + 1, updated_at = now()
 where user_id = (select auth.uid()) and revision = expected_revision
 returning revision into next_revision;
 if next_revision is null then raise exception 'SYNC_CONFLICT: remote progress changed'; end if;
 return next_revision;
end $$;
revoke all on function public.atlas_save_progress(bigint,jsonb) from public;
grant execute on function public.atlas_save_progress(bigint,jsonb) to authenticated;
