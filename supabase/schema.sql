-- Plataforma Tu Prof — schema inicial
-- Rode este script inteiro no SQL Editor do seu projeto Supabase (Supabase Dashboard > SQL Editor > New query).

-- ========== TABELAS ==========

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  role text not null default 'aluno' check (role in ('admin', 'aluno')),
  created_at timestamptz not null default now()
);

create table public.turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  calendario_embed_url text,
  created_at timestamptz not null default now()
);

create table public.turma_membros (
  turma_id uuid not null references public.turmas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  primary key (turma_id, aluno_id)
);

create table public.materias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create table public.materiais (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias (id) on delete cascade,
  tipo text not null check (tipo in ('html', 'pdf', 'video', 'playlist', 'podcast', 'link_externo')),
  titulo text not null,
  conteudo_html text,
  arquivo_path text,
  url text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create table public.material_turmas (
  material_id uuid not null references public.materiais (id) on delete cascade,
  turma_id uuid not null references public.turmas (id) on delete cascade,
  primary key (material_id, turma_id)
);

create table public.material_alunos (
  material_id uuid not null references public.materiais (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  primary key (material_id, aluno_id)
);

create table public.progresso (
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  material_id uuid not null references public.materiais (id) on delete cascade,
  concluido boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (aluno_id, material_id)
);

create table public.configuracoes (
  chave text primary key,
  valor text
);

insert into public.configuracoes (chave, valor) values
  ('app_treino_url', null),
  ('app_treino_label', 'Acessar app de treino');

-- ========== NOVO USUÁRIO -> PERFIL AUTOMÁTICO ==========
-- Sempre que alguém se autentica pela primeira vez (magic link), cria o profile como 'aluno'.
-- Pra virar admin, rode manualmente depois:
--   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== HELPER: is_admin() ==========
-- security definer evita recursão de RLS ao checar o papel do usuário dentro de outras policies.

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ========== RLS ==========

alter table public.profiles enable row level security;
alter table public.turmas enable row level security;
alter table public.turma_membros enable row level security;
alter table public.materias enable row level security;
alter table public.materiais enable row level security;
alter table public.material_turmas enable row level security;
alter table public.material_alunos enable row level security;
alter table public.progresso enable row level security;
alter table public.configuracoes enable row level security;

-- profiles: cada um vê o próprio; admin vê/edita todos
create policy "profiles: self select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin manage" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- turmas: admin gerencia; aluno vê as turmas em que está matriculado
create policy "turmas: admin manage" on public.turmas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "turmas: aluno select" on public.turmas
  for select using (
    exists (select 1 from public.turma_membros tm where tm.turma_id = id and tm.aluno_id = auth.uid())
  );

-- turma_membros: admin gerencia; aluno vê a própria matrícula
create policy "turma_membros: admin manage" on public.turma_membros
  for all using (public.is_admin()) with check (public.is_admin());
create policy "turma_membros: aluno select" on public.turma_membros
  for select using (aluno_id = auth.uid());

-- materias: admin gerencia; qualquer aluno autenticado pode ver (são só "pastas" de assunto)
create policy "materias: admin manage" on public.materias
  for all using (public.is_admin()) with check (public.is_admin());
create policy "materias: aluno select" on public.materias
  for select using (auth.uid() is not null);

-- materiais: admin gerencia; aluno vê se o material foi liberado pra turma dele ou pra ele diretamente
create policy "materiais: admin manage" on public.materiais
  for all using (public.is_admin()) with check (public.is_admin());
create policy "materiais: aluno select" on public.materiais
  for select using (
    exists (
      select 1 from public.material_turmas mt
      join public.turma_membros tm on tm.turma_id = mt.turma_id
      where mt.material_id = id and tm.aluno_id = auth.uid()
    )
    or exists (
      select 1 from public.material_alunos ma
      where ma.material_id = id and ma.aluno_id = auth.uid()
    )
  );

-- material_turmas / material_alunos: admin gerencia; aluno só enxerga o que é dele (pra permitir o join acima)
create policy "material_turmas: admin manage" on public.material_turmas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "material_turmas: aluno select" on public.material_turmas
  for select using (
    exists (select 1 from public.turma_membros tm where tm.turma_id = turma_id and tm.aluno_id = auth.uid())
  );

create policy "material_alunos: admin manage" on public.material_alunos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "material_alunos: aluno select" on public.material_alunos
  for select using (aluno_id = auth.uid());

-- progresso: cada aluno gerencia o próprio progresso; admin vê tudo
create policy "progresso: aluno manage own" on public.progresso
  for all using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
create policy "progresso: admin select" on public.progresso
  for select using (public.is_admin());

-- configuracoes: qualquer autenticado lê; só admin escreve
create policy "configuracoes: select autenticado" on public.configuracoes
  for select using (auth.uid() is not null);
create policy "configuracoes: admin manage" on public.configuracoes
  for all using (public.is_admin()) with check (public.is_admin());

-- ========== STORAGE (PDFs) ==========
-- Cria o bucket "materiais" (privado) automaticamente.

insert into storage.buckets (id, name, public)
values ('materiais', 'materiais', false)
on conflict (id) do nothing;

create policy "materiais bucket: admin manage" on storage.objects
  for all using (bucket_id = 'materiais' and public.is_admin())
  with check (bucket_id = 'materiais' and public.is_admin());

create policy "materiais bucket: aluno read" on storage.objects
  for select using (bucket_id = 'materiais' and auth.uid() is not null);
