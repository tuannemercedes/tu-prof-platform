-- Tu Prof Corporate
--   empresas   -> clientes B2B (contato de RH)
--   contratos  -> o que cada empresa contratou e por quanto tempo
--   turmas.empresa_id -> os grupos da empresa são programas ligados a ela
--   turmas.professor_id -> quem conduz o grupo (professor gerencia as aulas dele)
--   aulas.turma_id -> aula de grupo (aluno_id fica vazio)
--   presencas  -> quem foi em cada aula de grupo
-- Dados comerciais (empresa, contrato) são só da admin.

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato_nome text,
  contato_email text,
  contato_telefone text,
  observacoes text,
  created_at timestamptz not null default now()
);
alter table public.empresas enable row level security;
create policy "empresas: admin" on public.empresas for all using (public.is_admin()) with check (public.is_admin());
create policy "empresas: staff select" on public.empresas for select using (public.is_staff());

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  descricao text,
  idioma text not null default 'espanhol' check (idioma in ('espanhol', 'ingles', 'espanhol_ingles', 'portugues')),
  valor_mensal numeric(10, 2),
  max_acessos integer,
  aulas_mes integer,
  inicio date,
  fim date,
  observacoes text,
  created_at timestamptz not null default now()
);
create index contratos_empresa_idx on public.contratos (empresa_id, inicio);
alter table public.contratos enable row level security;
create policy "contratos: admin" on public.contratos for all using (public.is_admin()) with check (public.is_admin());

alter table public.turmas add column empresa_id uuid references public.empresas (id) on delete set null;
alter table public.turmas add column professor_id uuid references public.profiles (id) on delete set null;
create index turmas_empresa_idx on public.turmas (empresa_id);

create function public.pode_gerir_turma(turma uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (select 1 from public.turmas where id = turma and professor_id = auth.uid());
$$;
revoke execute on function public.pode_gerir_turma(uuid) from anon;

-- O professor do grupo também pode atualizar a lista de participantes.
create policy "turma_membros: professor do grupo" on public.turma_membros for all
  using (public.pode_gerir_turma(turma_id)) with check (public.pode_gerir_turma(turma_id));

-- ========== AULAS DE GRUPO ==========
alter table public.aulas alter column aluno_id drop not null;
alter table public.aulas add column turma_id uuid references public.turmas (id) on delete cascade;
alter table public.aulas add constraint aulas_dono_check check (aluno_id is not null or turma_id is not null);
create index aulas_turma_idx on public.aulas (turma_id, data);

create policy "aulas: aluno do grupo" on public.aulas for select using (
  turma_id in (select turma_id from public.turma_membros where aluno_id = auth.uid())
);
create policy "aulas: equipe do grupo" on public.aulas for all
  using (turma_id is not null and public.pode_gerir_turma(turma_id))
  with check (turma_id is not null and public.pode_gerir_turma(turma_id));
create policy "aulas: staff select" on public.aulas for select using (public.is_staff() and turma_id is not null);

-- ========== PRESENÇA ==========
create table public.presencas (
  aula_id uuid not null references public.aulas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  presente boolean not null default true,
  primary key (aula_id, aluno_id)
);
alter table public.presencas enable row level security;
create policy "presencas: aluno select" on public.presencas for select using (aluno_id = auth.uid());
create policy "presencas: equipe" on public.presencas for all
  using (exists (select 1 from public.aulas a where a.id = aula_id and a.turma_id is not null and public.pode_gerir_turma(a.turma_id)))
  with check (exists (select 1 from public.aulas a where a.id = aula_id and a.turma_id is not null and public.pode_gerir_turma(a.turma_id)));
create policy "presencas: staff select" on public.presencas for select using (public.is_staff());
