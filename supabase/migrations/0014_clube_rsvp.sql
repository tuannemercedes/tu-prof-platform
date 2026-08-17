-- Confirmação de presença dos alunos pra cada encontro do Clube de
-- Conversação, pra mentora saber se vale a pena dar aula ou não.

create table public.clube_rsvps (
  tema_id uuid not null references public.clube_temas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  confirmado boolean not null,
  updated_at timestamptz not null default now(),
  primary key (tema_id, aluno_id)
);

alter table public.clube_rsvps enable row level security;

create policy "clube_rsvps: aluno manage own" on public.clube_rsvps
  for all using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());

create policy "clube_rsvps: admin select" on public.clube_rsvps
  for select using (public.is_admin());
