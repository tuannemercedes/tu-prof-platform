-- Missões: um item de aula em que o aluno entrega áudio e/ou texto,
-- e a professora ou o monitor devolve um comentário de correção.

alter table public.materiais drop constraint materiais_tipo_check;
alter table public.materiais add constraint materiais_tipo_check
  check (tipo = any (array['html', 'pdf', 'video', 'playlist', 'podcast', 'link_externo', 'missao']));

-- Tipo de entrega pedido na missão.
alter table public.materiais add column entrega text
  check (entrega in ('audio', 'texto', 'audio_texto'));

create table public.missao_entregas (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materiais (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  audio_path text,
  texto text,
  created_at timestamptz not null default now(),
  comentario text,
  comentario_por uuid references public.profiles (id) on delete set null,
  comentario_em timestamptz,
  check (audio_path is not null or nullif(trim(texto), '') is not null)
);
create index missao_entregas_aluno_idx on public.missao_entregas (aluno_id, material_id);
create index missao_entregas_pendentes_idx on public.missao_entregas (created_at) where comentario_em is null;

alter table public.missao_entregas enable row level security;
create policy "missoes: aluno ve as suas" on public.missao_entregas for select
  using (aluno_id = auth.uid());
create policy "missoes: aluno envia" on public.missao_entregas for insert
  with check (aluno_id = auth.uid() and comentario is null and comentario_em is null and comentario_por is null);
create policy "missoes: equipe" on public.missao_entregas for all
  using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));
