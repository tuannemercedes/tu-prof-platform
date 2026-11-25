-- Financeiro da Tu Prof (só a admin)
--   planos_alunos  contrato de cada aluno: valor mensal, início, duração (ou contínuo), dia de vencimento
--   cobrancas      mensalidades (geradas sozinhas todo mês) e cobranças avulsas; também de empresas
--   despesas       gastos da empresa por categoria
--   das_mei        guia mensal do MEI (valor e pagamento)
--   configuracoes  chave 'financeiro': limite do MEI, pró-labore, % de reserva

create table public.planos_alunos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references public.profiles (id) on delete set null,
  cliente text not null,
  produto text,
  whatsapp text,
  valor_mensal numeric(10, 2) not null check (valor_mensal >= 0),
  inicio date not null,
  meses integer check (meses is null or meses > 0),
  dia_vencimento integer not null default 10 check (dia_vencimento between 1 and 28),
  observacoes text,
  encerrado_em date,
  origem_id text unique,
  created_at timestamptz not null default now()
);
create index planos_alunos_aluno_idx on public.planos_alunos (aluno_id);
alter table public.planos_alunos enable row level security;
create policy "planos_alunos: admin" on public.planos_alunos for all using (public.is_admin()) with check (public.is_admin());

create table public.cobrancas (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid references public.planos_alunos (id) on delete cascade,
  contrato_id uuid references public.contratos (id) on delete cascade,
  cliente text not null,
  descricao text not null,
  valor numeric(10, 2) not null check (valor >= 0),
  vencimento date not null,
  competencia date,
  pago_em date,
  valor_pago numeric(10, 2),
  forma text,
  observacoes text,
  origem_id text unique,
  created_at timestamptz not null default now(),
  unique (plano_id, competencia),
  unique (contrato_id, competencia)
);
create index cobrancas_vencimento_idx on public.cobrancas (vencimento);
alter table public.cobrancas enable row level security;
create policy "cobrancas: admin" on public.cobrancas for all using (public.is_admin()) with check (public.is_admin());

create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  categoria text not null default 'Outros',
  valor numeric(10, 2) not null check (valor >= 0),
  data date not null,
  observacoes text,
  origem_id text unique,
  created_at timestamptz not null default now()
);
create index despesas_data_idx on public.despesas (data);
alter table public.despesas enable row level security;
create policy "despesas: admin" on public.despesas for all using (public.is_admin()) with check (public.is_admin());

create table public.das_mei (
  competencia date primary key,
  valor numeric(10, 2) not null,
  pago_em date
);
alter table public.das_mei enable row level security;
create policy "das_mei: admin" on public.das_mei for all using (public.is_admin()) with check (public.is_admin());

-- Mensalidades do mês: cria a cobrança de cada plano ativo (uma por mês, sem repetir).
-- Começa no mês do início do plano ou no mês em que ele foi cadastrado (o que vier depois),
-- para não criar atrasos falsos de meses antigos.
create function public.gerar_mensalidades(p_ate date default (now() at time zone 'America/Bahia')::date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer := 0;
  v_n integer;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'sem permissão';
  end if;
  insert into public.cobrancas (plano_id, cliente, descricao, valor, vencimento, competencia)
  select p.id, p.cliente, 'Mensalidade' || coalesce(' · ' || p.produto, ''), p.valor_mensal,
         make_date(extract(year from m)::int, extract(month from m)::int, p.dia_vencimento), m::date
  from public.planos_alunos p
  cross join lateral generate_series(
    date_trunc('month', greatest(p.inicio, (p.created_at at time zone 'America/Bahia')::date)),
    date_trunc('month', p_ate),
    interval '1 month'
  ) m
  where p.valor_mensal > 0
    and (p.encerrado_em is null or m < date_trunc('month', p.encerrado_em) + interval '1 month')
    and (p.meses is null or m < date_trunc('month', p.inicio) + make_interval(months => p.meses))
  on conflict (plano_id, competencia) do nothing;
  get diagnostics v_n = row_count;
  v_total := v_total + v_n;

  -- Contratos de empresa com valor mensal: mesma lógica (vencimento no dia 10).
  insert into public.cobrancas (contrato_id, cliente, descricao, valor, vencimento, competencia)
  select c.id, e.nome, 'Mensalidade' || coalesce(' · ' || c.descricao, ''), c.valor_mensal,
         make_date(extract(year from m)::int, extract(month from m)::int, 10), m::date
  from public.contratos c
  join public.empresas e on e.id = c.empresa_id
  cross join lateral generate_series(
    date_trunc('month', greatest(coalesce(c.inicio, c.created_at::date), c.created_at::date)),
    date_trunc('month', p_ate),
    interval '1 month'
  ) m
  where coalesce(c.valor_mensal, 0) > 0
    and (c.fim is null or m <= date_trunc('month', c.fim))
  on conflict (contrato_id, competencia) do nothing;
  get diagnostics v_n = row_count;
  return v_total + v_n;
end;
$$;
revoke execute on function public.gerar_mensalidades(date) from anon;

-- Todo dia às 6h (Bahia), garante as mensalidades do mês.
select cron.schedule('financeiro-mensalidades', '0 9 * * *', $$select public.gerar_mensalidades()$$);
