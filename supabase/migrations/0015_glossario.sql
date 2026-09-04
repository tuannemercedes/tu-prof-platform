-- Glossário: lista de termos + definições (estilo dicionário), com o
-- mesmo padrão de liberação (todos/turma/aluno) do Clube de Conversação.

create table public.glossario_config (
  id int primary key default 1 check (id = 1),
  visivel_todos boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.glossario_config (id) values (1);

create table public.glossario_termos (
  id uuid primary key default gen_random_uuid(),
  termo text not null,
  definicao text not null,
  exemplo text,
  created_at timestamptz not null default now()
);

create table public.glossario_turmas (
  turma_id uuid primary key references public.turmas (id) on delete cascade
);

create table public.glossario_alunos (
  aluno_id uuid primary key references public.profiles (id) on delete cascade
);

-- ========== RLS ==========

alter table public.glossario_config enable row level security;
alter table public.glossario_termos enable row level security;
alter table public.glossario_turmas enable row level security;
alter table public.glossario_alunos enable row level security;

create policy "glossario_config: admin manage" on public.glossario_config
  for all using (public.is_admin()) with check (public.is_admin());
create policy "glossario_config: aluno select" on public.glossario_config
  for select using (
    visivel_todos = true
    or exists (select 1 from public.glossario_alunos ga where ga.aluno_id = auth.uid())
    or exists (
      select 1 from public.glossario_turmas gt
      join public.turma_membros tm on tm.turma_id = gt.turma_id
      where tm.aluno_id = auth.uid()
    )
  );

create policy "glossario_termos: admin manage" on public.glossario_termos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "glossario_termos: aluno select" on public.glossario_termos
  for select using (
    exists (select 1 from public.glossario_config gc where gc.visivel_todos = true)
    or exists (select 1 from public.glossario_alunos ga where ga.aluno_id = auth.uid())
    or exists (
      select 1 from public.glossario_turmas gt
      join public.turma_membros tm on tm.turma_id = gt.turma_id
      where tm.aluno_id = auth.uid()
    )
  );

create policy "glossario_turmas: admin manage" on public.glossario_turmas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "glossario_turmas: aluno select" on public.glossario_turmas
  for select using (
    exists (
      select 1 from public.turma_membros tm
      where tm.turma_id = glossario_turmas.turma_id and tm.aluno_id = auth.uid()
    )
  );

create policy "glossario_alunos: admin manage" on public.glossario_alunos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "glossario_alunos: aluno select" on public.glossario_alunos
  for select using (aluno_id = auth.uid());
