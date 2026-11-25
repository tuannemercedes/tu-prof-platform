-- Remarcação, desmarcação e reposição de aulas
--   aulas.status       agendada | realizada | cancelada  ('reposicao' nunca foi usado)
--   aulas.cancelamento repor (a aula será reposta) | sem_reposicao (falta sem aviso: conta como dada)
--   aulas.remarcada_de data anterior, quando a aula muda de dia/hora
--   aulas.reposicao_de a aula desmarcada que esta aula repõe
--   pedidos_remarcacao  o aluno pede para remarcar; a professora vê na ficha e recebe e-mail

alter table public.aulas drop constraint aulas_status_check;
update public.aulas set status = 'agendada' where status = 'reposicao';
alter table public.aulas add constraint aulas_status_check check (status in ('agendada', 'realizada', 'cancelada'));

alter table public.aulas
  add column cancelamento text check (cancelamento in ('repor', 'sem_reposicao')),
  add column motivo text,
  add column remarcada_de timestamptz,
  add column reposicao_de uuid unique references public.aulas (id) on delete set null;

create table public.pedidos_remarcacao (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas (id) on delete cascade,
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  mensagem text,
  sugestao text,
  criado_em timestamptz not null default now(),
  resolvido_em timestamptz
);
create index pedidos_remarcacao_aluno_idx on public.pedidos_remarcacao (aluno_id) where resolvido_em is null;
alter table public.pedidos_remarcacao enable row level security;

create policy "pedidos_remarcacao: aluno select" on public.pedidos_remarcacao
  for select using (aluno_id = auth.uid());
create policy "pedidos_remarcacao: aluno insert" on public.pedidos_remarcacao
  for insert with check (
    aluno_id = auth.uid()
    and exists (
      select 1 from public.aulas a
      where a.id = aula_id and a.status = 'agendada'
        and (a.aluno_id = auth.uid()
             or a.turma_id in (select turma_id from public.turma_membros where aluno_id = auth.uid()))
    )
  );
create policy "pedidos_remarcacao: equipe" on public.pedidos_remarcacao
  for all using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));

-- Aula remarcada ou desmarcada -> e-mail para o aluno (ou para o grupo).
create function public.aviso_aula_mudou()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'agendada' and new.status = 'agendada'
     and new.data is distinct from old.data and new.data > now() then
    insert into public.avisos_fila (tipo, destinatario, dados, chave, enviar_apos)
    select 'aula_remarcada', d, jsonb_build_object('aula_id', new.id),
           'remarcada:' || new.id || ':' || d || ':' || extract(epoch from new.data)::bigint, now() + interval '2 minutes'
    from public.destinatarios(new.aluno_id, new.turma_id) d
    on conflict (chave) do nothing;
  end if;

  if old.status = 'agendada' and new.status = 'cancelada' and old.data > now() then
    insert into public.avisos_fila (tipo, destinatario, dados, chave, enviar_apos)
    select 'aula_desmarcada', d, jsonb_build_object('aula_id', new.id),
           'desmarcada:' || new.id || ':' || d, now() + interval '2 minutes'
    from public.destinatarios(new.aluno_id, new.turma_id) d
    on conflict (chave) do nothing;
  end if;
  return new;
end;
$$;
create trigger aulas_aviso_mudou after update on public.aulas
  for each row execute function public.aviso_aula_mudou();

-- Pedido de remarcação -> e-mail para o professor do aluno (ou do grupo); sem professor, para a admin.
create function public.aviso_pedido_remarcacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prof uuid;
begin
  select coalesce(t.professor_id, p.professor_id) into v_prof
  from public.aulas a
  left join public.turmas t on t.id = a.turma_id
  left join public.profiles p on p.id = new.aluno_id
  where a.id = new.aula_id;

  insert into public.avisos_fila (tipo, destinatario, dados, chave)
  select 'pedido_remarcacao', s.id, jsonb_build_object('pedido_id', new.id), 'pedido:' || new.id || ':' || s.id
  from public.profiles s
  where (v_prof is not null and s.id = v_prof) or (v_prof is null and s.role = 'admin')
  on conflict (chave) do nothing;
  return new;
end;
$$;
create trigger pedidos_remarcacao_aviso after insert on public.pedidos_remarcacao
  for each row execute function public.aviso_pedido_remarcacao();

revoke execute on function public.aviso_aula_mudou() from anon, authenticated;
revoke execute on function public.aviso_pedido_remarcacao() from anon, authenticated;
