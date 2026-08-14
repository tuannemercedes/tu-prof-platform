-- Planner deixa de ser 1:1 por aluno e vira um "template" reutilizável
-- (igual materiais e cronograma): cria uma vez, libera pra turma(s) e/ou aluno(s).

create table public.planners (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  created_at timestamptz not null default now()
);

create table public.planner_turmas (
  planner_id uuid not null references public.planners (id) on delete cascade,
  turma_id uuid not null references public.turmas (id) on delete cascade,
  primary key (planner_id, turma_id)
);

create table public.planner_alunos (
  planner_id uuid not null references public.planners (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  primary key (planner_id, aluno_id)
);

alter table public.planner_dias
  add column planner_id uuid references public.planners (id) on delete cascade;

-- migra planner_dias existentes (por aluno) para o novo modelo, criando um
-- planner nomeado com o aluno e liberando só pra ele.
do $$
declare
  r record;
  novo_id uuid;
begin
  for r in select distinct aluno_id from public.planner_dias where planner_id is null loop
    insert into public.planners (titulo)
    select 'Planner de ' || coalesce(p.nome, p.email)
    from public.profiles p where p.id = r.aluno_id
    returning id into novo_id;

    update public.planner_dias set planner_id = novo_id where aluno_id = r.aluno_id;

    insert into public.planner_alunos (planner_id, aluno_id) values (novo_id, r.aluno_id);
  end loop;
end $$;

alter table public.planner_dias alter column planner_id set not null;

-- as policies antigas dependem de planner_dias.aluno_id / precisam sair
-- antes de a coluna ser removida.
drop policy "planner_dias: aluno select" on public.planner_dias;
drop policy "planner_itens: aluno select" on public.planner_itens;
drop policy "planner_itens: aluno update" on public.planner_itens;

alter table public.planner_dias drop column aluno_id;

-- ========== RLS ==========

alter table public.planners enable row level security;
alter table public.planner_turmas enable row level security;
alter table public.planner_alunos enable row level security;

create policy "planners: admin manage" on public.planners
  for all using (public.is_admin()) with check (public.is_admin());
create policy "planners: aluno select" on public.planners
  for select using (auth.uid() is not null);

create policy "planner_turmas: admin manage" on public.planner_turmas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "planner_turmas: aluno select" on public.planner_turmas
  for select using (
    exists (select 1 from public.turma_membros tm where tm.turma_id = planner_turmas.turma_id and tm.aluno_id = auth.uid())
  );

create policy "planner_alunos: admin manage" on public.planner_alunos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "planner_alunos: aluno select" on public.planner_alunos
  for select using (aluno_id = auth.uid());

create policy "planner_dias: aluno select" on public.planner_dias
  for select using (
    exists (
      select 1 from public.planner_turmas pt
      join public.turma_membros tm on tm.turma_id = pt.turma_id
      where pt.planner_id = planner_dias.planner_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.planner_alunos pa
      where pa.planner_id = planner_dias.planner_id and pa.aluno_id = auth.uid()
    )
  );

create policy "planner_itens: aluno select" on public.planner_itens
  for select using (
    exists (
      select 1 from public.planner_dias d
      join public.planner_turmas pt on pt.planner_id = d.planner_id
      join public.turma_membros tm on tm.turma_id = pt.turma_id
      where d.id = planner_itens.dia_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.planner_dias d
      join public.planner_alunos pa on pa.planner_id = d.planner_id
      where d.id = planner_itens.dia_id and pa.aluno_id = auth.uid()
    )
  );

create policy "planner_itens: aluno update" on public.planner_itens
  for update using (
    exists (
      select 1 from public.planner_dias d
      join public.planner_turmas pt on pt.planner_id = d.planner_id
      join public.turma_membros tm on tm.turma_id = pt.turma_id
      where d.id = planner_itens.dia_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.planner_dias d
      join public.planner_alunos pa on pa.planner_id = d.planner_id
      where d.id = planner_itens.dia_id and pa.aluno_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.planner_dias d
      join public.planner_turmas pt on pt.planner_id = d.planner_id
      join public.turma_membros tm on tm.turma_id = pt.turma_id
      where d.id = planner_itens.dia_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.planner_dias d
      join public.planner_alunos pa on pa.planner_id = d.planner_id
      where d.id = planner_itens.dia_id and pa.aluno_id = auth.uid()
    )
  );
