-- Cronograma: trajetória do aluno (data + tema de cada encontro ao vivo)
create table public.cronograma_itens (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  data date,
  tema text not null,
  descricao text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Planner: dias de estudo organizados por semana, com conteúdo rico e checklist
create table public.planner_dias (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  semana int not null default 1,
  titulo text not null,
  conteudo_html text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create table public.planner_itens (
  id uuid primary key default gen_random_uuid(),
  dia_id uuid not null references public.planner_dias (id) on delete cascade,
  texto text not null,
  concluido boolean not null default false,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cronograma_itens enable row level security;
alter table public.planner_dias enable row level security;
alter table public.planner_itens enable row level security;

create policy "cronograma_itens: admin manage" on public.cronograma_itens
  for all using (public.is_admin()) with check (public.is_admin());
create policy "cronograma_itens: aluno select" on public.cronograma_itens
  for select using (aluno_id = auth.uid());

create policy "planner_dias: admin manage" on public.planner_dias
  for all using (public.is_admin()) with check (public.is_admin());
create policy "planner_dias: aluno select" on public.planner_dias
  for select using (aluno_id = auth.uid());

create policy "planner_itens: admin manage" on public.planner_itens
  for all using (public.is_admin()) with check (public.is_admin());
create policy "planner_itens: aluno select" on public.planner_itens
  for select using (
    exists (select 1 from public.planner_dias d where d.id = dia_id and d.aluno_id = auth.uid())
  );
create policy "planner_itens: aluno update" on public.planner_itens
  for update using (
    exists (select 1 from public.planner_dias d where d.id = dia_id and d.aluno_id = auth.uid())
  ) with check (
    exists (select 1 from public.planner_dias d where d.id = dia_id and d.aluno_id = auth.uid())
  );
