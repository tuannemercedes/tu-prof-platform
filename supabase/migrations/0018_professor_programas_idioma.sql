-- Etapa 1 da reforma: equipe com professores, turmas viram "programas"
-- (com idioma) e cada aluno pode ter um professor responsável.
--
-- Regras de acesso:
--   admin     -> tudo (como antes)
--   professor -> lê todo o conteúdo da escola e o perfil dos próprios alunos;
--                não altera nada nesta etapa (escrita do professor vem na Etapa 3)
--   aluno     -> como antes

-- ========== PAPEL "professor" ==========

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'professor', 'aluno'));

-- Professor responsável pelo aluno (opcional)
alter table public.profiles
  add column professor_id uuid references public.profiles (id) on delete set null;

create index if not exists profiles_professor_id_idx on public.profiles (professor_id);

-- ========== PROGRAMAS (tabela "turmas") ==========
-- O nome técnico continua "turmas" para não quebrar nada; na tela vira "Programas".

alter table public.turmas
  add column idioma text not null default 'espanhol'
    check (idioma in ('espanhol', 'ingles', 'espanhol_ingles', 'portugues'));
alter table public.turmas add column descricao text;
alter table public.turmas add column ordem int not null default 0;

-- ========== HELPER: is_staff() ==========

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'professor')
  );
$$;

-- ========== PROTEÇÃO: aluno/professor não muda o próprio papel nem o professor ==========

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      new.role := old.role;
    end if;
    if new.professor_id is distinct from old.professor_id then
      new.professor_id := old.professor_id;
    end if;
  end if;
  return new;
end;
$$;

-- ========== RLS: professor ==========

-- Perfis: o professor vê o próprio perfil (já coberto) e o dos alunos dele.
create policy "profiles: professor select alunos" on public.profiles
  for select using (professor_id = auth.uid());

-- Conteúdo da escola: leitura para toda a equipe.
do $$
declare
  t text;
begin
  foreach t in array array[
    'turmas', 'turma_membros',
    'materiais', 'material_turmas', 'material_alunos', 'fases',
    'cronogramas', 'cronograma_itens', 'cronograma_turmas', 'cronograma_alunos',
    'planners', 'planner_dias', 'planner_itens', 'planner_turmas', 'planner_alunos',
    'clube_config', 'clube_temas', 'clube_turmas', 'clube_alunos', 'clube_rsvps',
    'glossario_config', 'glossario_termos', 'glossario_categorias',
    'glossario_turmas', 'glossario_alunos',
    'progresso'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select using (public.is_staff())',
      t || ': staff select', t
    );
  end loop;
end;
$$;
