-- Jogo de cartas: frente = como o brasileiro costuma falar (incorreto), verso = forma correta + explicação + áudio.
create table public.cartas (
  id uuid primary key default gen_random_uuid(),
  idioma text not null check (idioma in ('espanhol', 'ingles')),
  categoria text not null,
  incorreta text not null,
  correta text not null,
  explicacao text,
  audio_path text,
  publicada boolean not null default false,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);
create index cartas_idioma_cat_idx on public.cartas (idioma, categoria);
alter table public.cartas enable row level security;
create policy "cartas: aluno vê as publicadas" on public.cartas for select using (auth.uid() is not null and publicada);
create policy "cartas: equipe vê tudo" on public.cartas for select using (public.is_staff());
create policy "cartas: admin edita" on public.cartas for all using (public.is_admin()) with check (public.is_admin());

-- Progresso de cada aluno em cada carta (repetição espaçada simples por níveis).
create table public.cartas_progresso (
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  carta_id uuid not null references public.cartas (id) on delete cascade,
  nivel integer not null default 0,
  acertos integer not null default 0,
  erros integer not null default 0,
  proxima_em date not null default current_date,
  ultima_em timestamptz not null default now(),
  primary key (aluno_id, carta_id)
);
alter table public.cartas_progresso enable row level security;
create policy "cartas_progresso: o próprio aluno" on public.cartas_progresso for all using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
create policy "cartas_progresso: equipe vê" on public.cartas_progresso for select using (public.pode_gerir_aluno(aluno_id));

insert into storage.buckets (id, name, public) values ('cartas-audio', 'cartas-audio', true) on conflict (id) do nothing;
create policy "cartas-audio: admin" on storage.objects for all using (bucket_id = 'cartas-audio' and public.is_admin()) with check (bucket_id = 'cartas-audio' and public.is_admin());
create policy "cartas-audio: leitura" on storage.objects for select using (bucket_id = 'cartas-audio');
