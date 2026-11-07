-- Mon Plan Mental, mode club : schema Supabase
-- A coller dans Supabase > SQL Editor, puis Run.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  coach_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  round int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  token uuid not null default gen_random_uuid(),
  name text not null,
  avatar text not null default '🙂',
  pos int not null default 0,
  score int not null default 0,
  bonus int not null default 0,
  step text not null default 'setup',
  last_round int not null default 0,
  state jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default now()
);

create index if not exists players_game_idx on public.players (game_id);
create unique index if not exists players_token_idx on public.players (token);

alter table public.games enable row level security;
alter table public.players enable row level security;

-- Le coach connecte voit et modifie uniquement ses parties et leurs joueurs.
drop policy if exists coach_games on public.games;
create policy coach_games on public.games for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists coach_players on public.players;
create policy coach_players on public.players for all to authenticated
  using (exists (select 1 from public.games g where g.id = players.game_id and g.coach_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = players.game_id and g.coach_id = auth.uid()));

-- Les joueurs n'ont aucun acces direct aux tables : ils passent par ces fonctions.

create or replace function public.join_game(p_code text, p_name text, p_avatar text)
returns json language plpgsql security definer set search_path = public as $$
declare g public.games; p public.players; n int;
begin
  select * into g from public.games where code = upper(trim(p_code));
  if not found then raise exception 'Code inconnu'; end if;
  if g.status = 'finished' then raise exception 'Cette partie est terminée'; end if;
  if length(trim(coalesce(p_name, ''))) < 1 then raise exception 'Prénom requis'; end if;
  select count(*) into n from public.players where game_id = g.id;
  if n >= 40 then raise exception 'Partie complète'; end if;
  insert into public.players (game_id, name, avatar)
    values (g.id, left(trim(p_name), 20), left(coalesce(p_avatar, '🙂'), 8))
    returning * into p;
  return json_build_object('token', p.token, 'player_id', p.id, 'code', g.code);
end $$;

create or replace function public.player_save(
  p_token uuid, p_pos int, p_score int, p_step text, p_last_round int, p_state jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_step not in ('setup', 'wait', 'roll', 'scenario', 'cards', 'challenge', 'validate') then
    raise exception 'Etape invalide';
  end if;
  update public.players
    set pos = greatest(0, least(p_pos, 50)),
        score = greatest(0, least(p_score, 5000)),
        step = p_step,
        last_round = p_last_round,
        state = p_state
    where token = p_token
      and not (step = 'done' and p_step = 'validate');
end $$;

create or replace function public.game_public(p_code text, p_token uuid default null)
returns json language plpgsql security definer set search_path = public as $$
declare g public.games; me json; r json;
begin
  select * into g from public.games where code = upper(trim(p_code));
  if not found then return null; end if;
  if p_token is not null then
    select to_json(x) into me from (
      select id, name, avatar, pos, score, bonus, step, last_round, state
      from public.players where token = p_token and game_id = g.id) x;
  end if;
  select json_build_object(
    'game', json_build_object('id', g.id, 'code', g.code, 'title', g.title, 'status', g.status, 'round', g.round),
    'players', coalesce((
      select json_agg(json_build_object('id', id, 'name', name, 'avatar', avatar, 'pos', pos,
                                        'total', score + bonus, 'step', step) order by joined_at)
      from public.players where game_id = g.id), '[]'::json),
    'me', me) into r;
  return r;
end $$;

create or replace function public.coach_validate(p_player uuid, p_ok boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.players p
    set step = case when p_ok then 'done' else 'challenge' end,
        bonus = p.bonus + case when p_ok then 20 else 0 end
    from public.games g
    where p.id = p_player and p.game_id = g.id
      and g.coach_id = auth.uid() and p.step = 'validate';
end $$;

grant execute on function public.join_game(text, text, text) to anon, authenticated;
grant execute on function public.player_save(uuid, int, int, text, int, jsonb) to anon, authenticated;
grant execute on function public.game_public(text, uuid) to anon, authenticated;
grant execute on function public.coach_validate(uuid, boolean) to authenticated;
