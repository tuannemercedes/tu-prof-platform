-- Etapa 3: o que o protótipo aprovado precisa para funcionar de verdade.
--   aulas            -> agenda e registro de cada aula do aluno
--   tarefas          -> tarefas com tipo de entrega (feita, texto, áudio, link)
--   tarefa_entregas  -> o que CADA aluno entregou (corrige o "marcou para todos")
--   plano_etapas     -> plano do semestre do aluno (mês, tema, entrega real)
--   programa_etapas  -> modelo de plano do programa
--   programa_materias-> módulos da trilha de cada programa
--   checkpoints      -> evolução: níveis por competência + comentário
-- Professor: lê e escreve só o que é dos alunos dele. Admin: tudo.

-- ========== DADOS DO ALUNO ==========
alter table public.profiles add column objetivo text;
alter table public.profiles add column foco text;
alter table public.profiles add column horario text;
alter table public.profiles add column plano_nome text;
alter table public.profiles add column link_aula text;

-- Biblioteca: idioma do material
alter table public.materiais add column idioma text not null default 'espanhol'
  check (idioma in ('espanhol', 'ingles', 'espanhol_ingles', 'portugues'));

-- ========== HELPERS ==========
create function public.is_professor_do(aluno uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = aluno and professor_id = auth.uid());
$$;

create function public.pode_gerir_aluno(aluno uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.is_professor_do(aluno);
$$;

-- O professor também pode editar os dados de acompanhamento dos alunos dele.
create policy "profiles: professor update alunos" on public.profiles
  for update using (public.is_professor_do(id)) with check (public.is_professor_do(id));

-- ========== AULAS ==========
create table public.aulas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  professor_id uuid references public.profiles (id) on delete set null,
  data timestamptz,
  tema text not null,
  descricao text,
  resumo text,
  status text not null default 'agendada' check (status in ('agendada', 'realizada', 'reposicao')),
  created_at timestamptz not null default now()
);
create index aulas_aluno_idx on public.aulas (aluno_id, data);
alter table public.aulas enable row level security;
create policy "aulas: aluno select" on public.aulas for select using (aluno_id = auth.uid());
create policy "aulas: equipe" on public.aulas for all
  using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));

-- ========== TAREFAS ==========
-- Uma tarefa vale para: um aluno (aluno_id), um programa inteiro (turma_id)
-- ou quem enxerga um material (material_id, segue o "Quem vê" do material).
create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references public.profiles (id) on delete cascade,
  turma_id uuid references public.turmas (id) on delete cascade,
  material_id uuid references public.materiais (id) on delete cascade,
  aula_id uuid references public.aulas (id) on delete set null,
  texto text not null,
  entrega text not null default 'feito' check (entrega in ('feito', 'texto', 'audio', 'link')),
  link_url text,
  prazo date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (aluno_id is not null or turma_id is not null or material_id is not null)
);
create index tarefas_aluno_idx on public.tarefas (aluno_id);
create index tarefas_turma_idx on public.tarefas (turma_id);
create index tarefas_material_idx on public.tarefas (material_id);
alter table public.tarefas enable row level security;

create policy "tarefas: aluno select" on public.tarefas for select using (
  aluno_id = auth.uid()
  or turma_id in (select turma_id from public.turma_membros where aluno_id = auth.uid())
  or (material_id is not null and exists (select 1 from public.materiais m where m.id = material_id))
);
create policy "tarefas: staff select" on public.tarefas for select using (public.is_staff());
create policy "tarefas: admin all" on public.tarefas for all
  using (public.is_admin()) with check (public.is_admin());
create policy "tarefas: professor dos alunos" on public.tarefas for all
  using (aluno_id is not null and public.is_professor_do(aluno_id))
  with check (aluno_id is not null and public.is_professor_do(aluno_id));

create table public.tarefa_entregas (
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  concluida boolean not null default false,
  resposta text,
  arquivo_path text,
  comentario text,
  updated_at timestamptz not null default now(),
  primary key (tarefa_id, aluno_id)
);
alter table public.tarefa_entregas enable row level security;
create policy "entregas: aluno proprio" on public.tarefa_entregas for all
  using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
create policy "entregas: equipe" on public.tarefa_entregas for all
  using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));

-- ========== PLANO DO ALUNO E MODELO DO PROGRAMA ==========
create table public.plano_etapas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  ordem int not null default 0,
  periodo text not null,
  tema text not null,
  entrega text,
  created_at timestamptz not null default now()
);
alter table public.plano_etapas enable row level security;
create policy "plano: aluno select" on public.plano_etapas for select using (aluno_id = auth.uid());
create policy "plano: equipe" on public.plano_etapas for all
  using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));

create table public.programa_etapas (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas (id) on delete cascade,
  ordem int not null default 0,
  periodo text not null,
  tema text not null,
  entrega text
);
alter table public.programa_etapas enable row level security;
create policy "programa_etapas: staff select" on public.programa_etapas for select using (public.is_staff());
create policy "programa_etapas: admin all" on public.programa_etapas for all
  using (public.is_admin()) with check (public.is_admin());

create table public.programa_materias (
  turma_id uuid not null references public.turmas (id) on delete cascade,
  materia_id uuid not null references public.materias (id) on delete cascade,
  ordem int not null default 0,
  primary key (turma_id, materia_id)
);
alter table public.programa_materias enable row level security;
create policy "programa_materias: logado select" on public.programa_materias
  for select using (auth.uid() is not null);
create policy "programa_materias: admin all" on public.programa_materias for all
  using (public.is_admin()) with check (public.is_admin());

-- ========== EVOLUÇÃO ==========
create table public.checkpoints (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  data date not null default current_date,
  titulo text,
  niveis jsonb not null default '{}'::jsonb,
  comentario text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.checkpoints enable row level security;
create policy "checkpoints: aluno select" on public.checkpoints for select using (aluno_id = auth.uid());
create policy "checkpoints: equipe" on public.checkpoints for all
  using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));

-- Competências avaliadas nos checkpoints (editáveis em Configurações)
insert into public.configuracoes (chave, valor)
values ('competencias', '["Falar em reuniões","Entender o que dizem","Escrever e-mails","Apresentar"]')
on conflict (chave) do nothing;

-- ========== ÁUDIOS DAS ENTREGAS (Storage) ==========
insert into storage.buckets (id, name, public)
values ('entregas', 'entregas', false)
on conflict (id) do nothing;

-- Caminho do arquivo: <aluno_id>/<tarefa_id>/<arquivo>
create policy "entregas storage: aluno envia" on storage.objects for insert
  with check (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "entregas storage: aluno le" on storage.objects for select
  using (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "entregas storage: aluno troca" on storage.objects for update
  using (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "entregas storage: equipe le" on storage.objects for select
  using (
    bucket_id = 'entregas'
    and exists (
      select 1 from public.profiles p
      where p.id::text = (storage.foldername(name))[1]
        and (public.is_admin() or p.professor_id = auth.uid())
    )
  );
