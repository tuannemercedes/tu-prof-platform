-- Certificados Tu Prof: emitidos pela equipe, abertos pelo aluno e verificáveis
-- por qualquer pessoa pelo código (página pública /certificado/<codigo>).
create table public.certificados (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null default 'conclusao' check (tipo in ('conclusao', 'participacao')),
  titulo text not null,
  empresa text,
  carga_horaria integer,
  inicio date,
  fim date,
  nome_impresso text not null,
  emitido_em date not null default (now() at time zone 'America/Bahia')::date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index certificados_aluno_idx on public.certificados (aluno_id);
alter table public.certificados enable row level security;
create policy "certificados: aluno select" on public.certificados for select using (aluno_id = auth.uid());
create policy "certificados: staff select" on public.certificados for select using (public.is_staff());
create policy "certificados: admin" on public.certificados for all using (public.is_admin()) with check (public.is_admin());

-- Verificação pública pelo código (sem login): só os dados impressos no certificado.
create function public.certificado_por_codigo(p_codigo text)
returns table (codigo text, tipo text, titulo text, empresa text, carga_horaria integer, inicio date, fim date, nome_impresso text, emitido_em date)
language sql
stable
security definer
set search_path = public
as $$
  select codigo, tipo, titulo, empresa, carga_horaria, inicio, fim, nome_impresso, emitido_em
  from public.certificados where codigo = upper(trim(p_codigo));
$$;
grant execute on function public.certificado_por_codigo(text) to anon, authenticated;

-- Certificado emitido para um grupo (Corporate) guarda de qual grupo veio.
alter table public.certificados add column turma_id uuid references public.turmas (id) on delete set null;
