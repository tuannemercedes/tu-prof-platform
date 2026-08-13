-- Fases (módulos) dentro de uma matéria/trilha, agrupando materiais.
create table public.fases (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias (id) on delete cascade,
  titulo text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.materiais
  add column fase_id uuid references public.fases (id) on delete set null;

alter table public.fases enable row level security;

create policy "fases: admin manage" on public.fases
  for all using (public.is_admin()) with check (public.is_admin());

create policy "fases: aluno select" on public.fases
  for select using (auth.uid() is not null);
