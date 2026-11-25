-- Prévia da aula (formato das situações do Portal), liberada ao aluno 48h antes.
-- previa = {objetivo, situacao, expressoes:[{frase, traducao}], erro, preparo}
alter table public.aulas add column previa jsonb;

-- Quem abriu a prévia (entra no relatório do RH).
create table public.previa_vistas (
  aula_id uuid not null references public.aulas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  visto_em timestamptz not null default now(),
  primary key (aula_id, aluno_id)
);
alter table public.previa_vistas enable row level security;
create policy "previa_vistas: aluno registra" on public.previa_vistas for insert
  with check (aluno_id = auth.uid() and exists (select 1 from public.aulas a where a.id = aula_id));
create policy "previa_vistas: aluno select" on public.previa_vistas for select using (aluno_id = auth.uid());
create policy "previa_vistas: staff select" on public.previa_vistas for select using (public.is_staff());
