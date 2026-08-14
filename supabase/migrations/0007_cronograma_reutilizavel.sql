-- Cronograma deixa de ser 1:1 por aluno e vira um "template" reutilizável
-- (igual materiais): cria uma vez, libera pra turma(s) e/ou aluno(s).

create table public.cronogramas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  created_at timestamptz not null default now()
);

create table public.cronograma_turmas (
  cronograma_id uuid not null references public.cronogramas (id) on delete cascade,
  turma_id uuid not null references public.turmas (id) on delete cascade,
  primary key (cronograma_id, turma_id)
);

create table public.cronograma_alunos (
  cronograma_id uuid not null references public.cronogramas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  primary key (cronograma_id, aluno_id)
);

alter table public.cronograma_itens
  add column cronograma_id uuid references public.cronogramas (id) on delete cascade;

-- migra cronograma_itens existentes (1 por aluno) para o novo modelo,
-- criando um cronograma nomeado com o aluno e liberando só pra ele.
do $$
declare
  r record;
  novo_id uuid;
begin
  for r in select distinct aluno_id from public.cronograma_itens where cronograma_id is null loop
    insert into public.cronogramas (titulo)
    select 'Cronograma de ' || coalesce(p.nome, p.email)
    from public.profiles p where p.id = r.aluno_id
    returning id into novo_id;

    update public.cronograma_itens set cronograma_id = novo_id where aluno_id = r.aluno_id;

    insert into public.cronograma_alunos (cronograma_id, aluno_id) values (novo_id, r.aluno_id);
  end loop;
end $$;

alter table public.cronograma_itens alter column cronograma_id set not null;

drop policy "cronograma_itens: aluno select" on public.cronograma_itens;
alter table public.cronograma_itens drop column aluno_id;

-- Planner: cada tarefa pode ter um link opcional (estilo Notion).
alter table public.planner_itens add column link_url text;

-- ========== RLS ==========

alter table public.cronogramas enable row level security;
alter table public.cronograma_turmas enable row level security;
alter table public.cronograma_alunos enable row level security;

create policy "cronogramas: admin manage" on public.cronogramas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "cronogramas: aluno select" on public.cronogramas
  for select using (auth.uid() is not null);

create policy "cronograma_turmas: admin manage" on public.cronograma_turmas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "cronograma_turmas: aluno select" on public.cronograma_turmas
  for select using (
    exists (select 1 from public.turma_membros tm where tm.turma_id = cronograma_turmas.turma_id and tm.aluno_id = auth.uid())
  );

create policy "cronograma_alunos: admin manage" on public.cronograma_alunos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "cronograma_alunos: aluno select" on public.cronograma_alunos
  for select using (aluno_id = auth.uid());

create policy "cronograma_itens: aluno select" on public.cronograma_itens
  for select using (
    exists (
      select 1 from public.cronograma_turmas ct
      join public.turma_membros tm on tm.turma_id = ct.turma_id
      where ct.cronograma_id = cronograma_itens.cronograma_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.cronograma_alunos ca
      where ca.cronograma_id = cronograma_itens.cronograma_id and ca.aluno_id = auth.uid()
    )
  );
