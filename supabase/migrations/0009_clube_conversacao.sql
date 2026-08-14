-- Clube de Conversação: uma área única (não é reutilizável tipo cronograma/
-- planner) com link de acesso, dia/horário fixo, temas por data (estilo
-- calendário) e liberação de quem vê o botão.

create table public.clube_config (
  id int primary key default 1 check (id = 1),
  link_acesso text,
  dia_horario text,
  updated_at timestamptz not null default now()
);

insert into public.clube_config (id) values (1);

create table public.clube_temas (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  tema text not null,
  descricao text,
  created_at timestamptz not null default now()
);

create table public.clube_turmas (
  turma_id uuid primary key references public.turmas (id) on delete cascade
);

create table public.clube_alunos (
  aluno_id uuid primary key references public.profiles (id) on delete cascade
);

-- ========== RLS ==========

alter table public.clube_config enable row level security;
alter table public.clube_temas enable row level security;
alter table public.clube_turmas enable row level security;
alter table public.clube_alunos enable row level security;

create policy "clube_config: admin manage" on public.clube_config
  for all using (public.is_admin()) with check (public.is_admin());
create policy "clube_config: aluno select" on public.clube_config
  for select using (
    exists (select 1 from public.clube_alunos ca where ca.aluno_id = auth.uid())
    or exists (
      select 1 from public.clube_turmas ct
      join public.turma_membros tm on tm.turma_id = ct.turma_id
      where tm.aluno_id = auth.uid()
    )
  );

create policy "clube_temas: admin manage" on public.clube_temas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "clube_temas: aluno select" on public.clube_temas
  for select using (
    exists (select 1 from public.clube_alunos ca where ca.aluno_id = auth.uid())
    or exists (
      select 1 from public.clube_turmas ct
      join public.turma_membros tm on tm.turma_id = ct.turma_id
      where tm.aluno_id = auth.uid()
    )
  );

create policy "clube_turmas: admin manage" on public.clube_turmas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "clube_turmas: aluno select" on public.clube_turmas
  for select using (
    exists (select 1 from public.turma_membros tm where tm.turma_id = clube_turmas.turma_id and tm.aluno_id = auth.uid())
  );

create policy "clube_alunos: admin manage" on public.clube_alunos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "clube_alunos: aluno select" on public.clube_alunos
  for select using (aluno_id = auth.uid());
