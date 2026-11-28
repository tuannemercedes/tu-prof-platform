-- Missões que o aluno só marca como feitas (sem correção) e aviso por e-mail
-- quando a equipe comenta uma Missão.
alter table public.materiais drop constraint materiais_entrega_check;
alter table public.materiais add constraint materiais_entrega_check
  check (entrega in ('audio', 'texto', 'audio_texto', 'feito'));

alter table public.missao_entregas add column precisa_correcao boolean not null default true;
alter table public.missao_entregas drop constraint missao_entregas_check;
alter table public.missao_entregas add constraint missao_entregas_conteudo_check
  check (audio_path is not null or nullif(trim(texto), '') is not null or not precisa_correcao);
drop index public.missao_entregas_pendentes_idx;
create index missao_entregas_pendentes_idx on public.missao_entregas (created_at)
  where comentario_em is null and precisa_correcao;

create function public.aviso_missao_comentada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.comentario is not null and new.comentario <> '' and new.comentario is distinct from old.comentario then
    insert into public.avisos_fila (tipo, destinatario, dados, chave, enviar_apos)
    values ('missao_comentada', new.aluno_id, jsonb_build_object('entrega_id', new.id),
            'missao:' || new.id || ':' || md5(new.comentario), now() + interval '2 minutes')
    on conflict (chave) do nothing;
  end if;
  return new;
end;
$$;
create trigger missao_entregas_aviso after update on public.missao_entregas
  for each row execute function public.aviso_missao_comentada();
revoke execute on function public.aviso_missao_comentada() from anon, authenticated;
update public.materiais set entrega = 'feito' where tipo = 'missao' and titulo in ('Missão Chave · ¿Qué significa…?', 'Missão Chave · Gostos na comunidade', 'Missão Chave · ¿Cómo estoy?');
