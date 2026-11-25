-- Relatório mensal individual: a equipe escreve o comentário do mês e publica;
-- o aluno passa a ver o relatório na plataforma e recebe por e-mail.
create table public.relatorios_mensais (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles (id) on delete cascade,
  mes date not null, -- sempre o dia 1 do mês
  comentario text,
  publicado_em timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (aluno_id, mes)
);
alter table public.relatorios_mensais enable row level security;
create policy "relatorios: aluno vê os publicados" on public.relatorios_mensais for select
  using (aluno_id = auth.uid() and publicado_em is not null);
create policy "relatorios: equipe do aluno" on public.relatorios_mensais for all
  using (public.pode_gerir_aluno(aluno_id)) with check (public.pode_gerir_aluno(aluno_id));

-- Avisos por e-mail: relatório publicado e certificado emitido.
create function public.aviso_relatorio()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.publicado_em is not null and (tg_op = 'INSERT' or old.publicado_em is null) then
    insert into public.avisos_fila (tipo, destinatario, dados, chave)
    values ('relatorio', new.aluno_id, jsonb_build_object('mes', new.mes), 'relatorio:' || new.aluno_id || ':' || new.mes)
    on conflict (chave) do nothing;
  end if;
  return new;
end;
$$;
create trigger relatorios_aviso after insert or update on public.relatorios_mensais
  for each row execute function public.aviso_relatorio();

create function public.aviso_certificado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.avisos_fila (tipo, destinatario, dados, chave)
  values ('certificado', new.aluno_id, jsonb_build_object('codigo', new.codigo), 'certificado:' || new.codigo)
  on conflict (chave) do nothing;
  return new;
end;
$$;
create trigger certificados_aviso after insert on public.certificados
  for each row execute function public.aviso_certificado();

revoke execute on function public.aviso_relatorio() from anon, authenticated;
revoke execute on function public.aviso_certificado() from anon, authenticated;
