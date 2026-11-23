-- Glossários gerais (aluno_id nulo) e exclusivos de um mentorado (aluno_id preenchido)
alter table public.glossario_termos add column aluno_id uuid references public.profiles (id) on delete cascade;
create index glossario_termos_aluno_idx on public.glossario_termos (aluno_id);

drop policy "glossario_termos: aluno select" on public.glossario_termos;
create policy "glossario_termos: aluno select" on public.glossario_termos for select using (
  aluno_id = auth.uid()
  or (
    aluno_id is null
    and (
      exists (select 1 from public.glossario_config gc where gc.visivel_todos = true)
      or exists (select 1 from public.glossario_alunos ga where ga.aluno_id = auth.uid())
      or exists (
        select 1 from public.glossario_turmas gt
        join public.turma_membros tm on tm.turma_id = gt.turma_id
        where tm.aluno_id = auth.uid()
      )
    )
  )
);

-- Professor cuida do glossário exclusivo dos alunos dele
create policy "glossario_termos: professor dos alunos" on public.glossario_termos for all
  using (aluno_id is not null and public.is_professor_do(aluno_id))
  with check (aluno_id is not null and public.is_professor_do(aluno_id));
