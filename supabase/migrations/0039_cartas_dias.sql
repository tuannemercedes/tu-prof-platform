-- Dias em que o aluno jogou as Cartas (para a sequência de dias seguidos).
create table if not exists public.cartas_dias (
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  dia date not null,
  cartas int not null default 0,
  primary key (aluno_id, dia)
);
alter table public.cartas_dias enable row level security;
create policy cartas_dias_proprio on public.cartas_dias for all to authenticated
  using (aluno_id = (select auth.uid())) with check (aluno_id = (select auth.uid()));
create policy cartas_dias_equipe on public.cartas_dias for select to authenticated
  using (public.pode_gerir_aluno(aluno_id));
