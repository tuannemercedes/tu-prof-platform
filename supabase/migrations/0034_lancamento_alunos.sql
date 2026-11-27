-- Lançamento: aluno cadastrado começa "em montagem" (sem nenhum e-mail).
-- Quando a admin libera, recebe as boas-vindas e passa a receber os avisos.
alter table public.profiles add column liberado_em timestamptz;
update public.profiles set liberado_em = now() where role <> 'aluno';
-- Equipe nasce liberada; aluno nasce em montagem.
create or replace function public.profiles_liberar_equipe()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.role <> 'aluno' and new.liberado_em is null then new.liberado_em := now(); end if;
  return new;
end;
$$;
create trigger profiles_liberar_equipe before insert or update of role on public.profiles
  for each row execute function public.profiles_liberar_equipe();
