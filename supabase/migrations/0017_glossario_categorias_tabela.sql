-- Categorias do glossário como entidade própria, pra dar pra criar a
-- categoria antes de ter qualquer termo dentro dela.

create table public.glossario_categorias (
  nome text primary key,
  created_at timestamptz not null default now()
);

alter table public.glossario_categorias enable row level security;

create policy "glossario_categorias: admin manage" on public.glossario_categorias
  for all using (public.is_admin()) with check (public.is_admin());

-- Traz pra tabela nova as categorias que já existem soltas nos termos.
insert into public.glossario_categorias (nome)
select distinct categoria from public.glossario_termos
where categoria is not null
on conflict (nome) do nothing;
