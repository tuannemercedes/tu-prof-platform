-- Avisos por e-mail
--   profiles.avisos  -> preferências de cada pessoa ({"aulas": false} desliga; vazio = tudo ligado)
--   avisos_fila      -> tudo o que precisa ser enviado. Os gatilhos abaixo e a função
--                       "avisos" (Supabase Edge Function, chamada a cada 5 min) colocam
--                       itens aqui; a mesma função envia pelo Resend.
-- Como tudo nasce no banco, os avisos saem também quando a Claude edita direto pelo Supabase.

alter table public.profiles add column avisos jsonb not null default '{}'::jsonb;

create table public.avisos_fila (
  id bigint generated always as identity primary key,
  tipo text not null,
  destinatario uuid not null references public.profiles (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  chave text unique,
  criado_em timestamptz not null default now(),
  enviar_apos timestamptz not null default now(),
  enviado_em timestamptz,
  status text not null default 'pendente' check (status in ('pendente', 'enviado', 'ignorado', 'erro')),
  erro text,
  tentativas integer not null default 0
);
create index avisos_fila_pendentes_idx on public.avisos_fila (enviar_apos) where status = 'pendente';
alter table public.avisos_fila enable row level security;
create policy "avisos_fila: admin" on public.avisos_fila for all using (public.is_admin()) with check (public.is_admin());

-- Quem recebe um aviso sobre uma tarefa/aula: o aluno dela ou todos do grupo.
create function public.destinatarios(p_aluno uuid, p_turma uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select p_aluno where p_aluno is not null
  union
  select aluno_id from public.turma_membros where p_turma is not null and turma_id = p_turma;
$$;
revoke execute on function public.destinatarios(uuid, uuid) from anon, authenticated;

-- Nova tarefa -> aviso para o aluno (ou para o grupo). Espera 3 min: dá tempo de corrigir.
create function public.aviso_tarefa_nova()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.avisos_fila (tipo, destinatario, dados, chave, enviar_apos)
  select 'tarefa_nova', d, jsonb_build_object('tarefa_id', new.id), 'tarefa:' || new.id || ':' || d, now() + interval '3 minutes'
  from public.destinatarios(new.aluno_id, new.turma_id) d
  on conflict (chave) do nothing;
  return new;
end;
$$;
create trigger tarefas_aviso_nova after insert on public.tarefas
  for each row execute function public.aviso_tarefa_nova();

-- Entregas: comentário da professora -> aluno; resposta do aluno -> professor (ou admin).
create function public.aviso_entrega()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prof uuid;
begin
  if new.comentario is not null and new.comentario <> ''
     and (tg_op = 'INSERT' or new.comentario is distinct from old.comentario) then
    insert into public.avisos_fila (tipo, destinatario, dados, chave, enviar_apos)
    values ('comentario', new.aluno_id, jsonb_build_object('tarefa_id', new.tarefa_id),
            'comentario:' || new.tarefa_id || ':' || new.aluno_id || ':' || md5(new.comentario), now() + interval '2 minutes')
    on conflict (chave) do nothing;
  end if;

  if (new.resposta is not null or new.arquivo_path is not null)
     and (tg_op = 'INSERT' or new.resposta is distinct from old.resposta or new.arquivo_path is distinct from old.arquivo_path) then
    select professor_id into v_prof from public.profiles where id = new.aluno_id;
    insert into public.avisos_fila (tipo, destinatario, dados, chave, enviar_apos)
    select 'entrega', s.id, jsonb_build_object('tarefa_id', new.tarefa_id, 'aluno_id', new.aluno_id),
           'entrega:' || new.tarefa_id || ':' || new.aluno_id || ':' || s.id || ':' || md5(coalesce(new.resposta, '') || coalesce(new.arquivo_path, '')),
           now() + interval '2 minutes'
    from public.profiles s
    where (v_prof is not null and s.id = v_prof) or (v_prof is null and s.role = 'admin')
    on conflict (chave) do nothing;
  end if;
  return new;
end;
$$;
create trigger tarefa_entregas_aviso after insert or update on public.tarefa_entregas
  for each row execute function public.aviso_entrega();

revoke execute on function public.aviso_tarefa_nova() from anon, authenticated;
revoke execute on function public.aviso_entrega() from anon, authenticated;
