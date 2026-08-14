-- Corrige a política "visivel_todos": do jeito que ficou em 0010, um
-- conteúdo com visivel_todos=true ficava legível até por gente sem login
-- nenhum (não só alunos autenticados). Adiciona a exigência de login.

drop policy "materiais: aluno select" on public.materiais;
create policy "materiais: aluno select" on public.materiais
  for select using (
    (auth.uid() is not null and visivel_todos = true)
    or exists (
      select 1 from public.material_turmas mt
      join public.turma_membros tm on tm.turma_id = mt.turma_id
      where mt.material_id = id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.material_alunos ma
      where ma.material_id = id and ma.aluno_id = auth.uid()
    )
  );

drop policy "cronograma_itens: aluno select" on public.cronograma_itens;
create policy "cronograma_itens: aluno select" on public.cronograma_itens
  for select using (
    (auth.uid() is not null and exists (
      select 1 from public.cronogramas c
      where c.id = cronograma_itens.cronograma_id and c.visivel_todos = true
    ))
    or exists (
      select 1 from public.cronograma_turmas ct
      join public.turma_membros tm on tm.turma_id = ct.turma_id
      where ct.cronograma_id = cronograma_itens.cronograma_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.cronograma_alunos ca
      where ca.cronograma_id = cronograma_itens.cronograma_id and ca.aluno_id = auth.uid()
    )
  );

drop policy "planner_dias: aluno select" on public.planner_dias;
create policy "planner_dias: aluno select" on public.planner_dias
  for select using (
    (auth.uid() is not null and exists (
      select 1 from public.planners p
      where p.id = planner_dias.planner_id and p.visivel_todos = true
    ))
    or exists (
      select 1 from public.planner_turmas pt
      join public.turma_membros tm on tm.turma_id = pt.turma_id
      where pt.planner_id = planner_dias.planner_id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.planner_alunos pa
      where pa.planner_id = planner_dias.planner_id and pa.aluno_id = auth.uid()
    )
  );

drop policy "planner_itens: aluno select" on public.planner_itens;
create policy "planner_itens: aluno select" on public.planner_itens
  for select using (
    (auth.uid() is not null and exists (
      select 1 from public.planner_dias d
      join public.planners p on p.id = d.planner_id
      where d.id = planner_itens.dia_id and p.visivel_todos = true
    ))
    or exists (
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

drop policy "planner_itens: aluno update" on public.planner_itens;
create policy "planner_itens: aluno update" on public.planner_itens
  for update using (
    (auth.uid() is not null and exists (
      select 1 from public.planner_dias d
      join public.planners p on p.id = d.planner_id
      where d.id = planner_itens.dia_id and p.visivel_todos = true
    ))
    or exists (
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
    (auth.uid() is not null and exists (
      select 1 from public.planner_dias d
      join public.planners p on p.id = d.planner_id
      where d.id = planner_itens.dia_id and p.visivel_todos = true
    ))
    or exists (
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

drop policy "clube_config: aluno select" on public.clube_config;
create policy "clube_config: aluno select" on public.clube_config
  for select using (
    (auth.uid() is not null and visivel_todos = true)
    or exists (select 1 from public.clube_alunos ca where ca.aluno_id = auth.uid())
    or exists (
      select 1 from public.clube_turmas ct
      join public.turma_membros tm on tm.turma_id = ct.turma_id
      where tm.aluno_id = auth.uid()
    )
  );

drop policy "clube_temas: aluno select" on public.clube_temas;
create policy "clube_temas: aluno select" on public.clube_temas
  for select using (
    (auth.uid() is not null and exists (select 1 from public.clube_config cc where cc.visivel_todos = true))
    or exists (select 1 from public.clube_alunos ca where ca.aluno_id = auth.uid())
    or exists (
      select 1 from public.clube_turmas ct
      join public.turma_membros tm on tm.turma_id = ct.turma_id
      where tm.aluno_id = auth.uid()
    )
  );
