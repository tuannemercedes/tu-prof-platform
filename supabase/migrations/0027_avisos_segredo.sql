-- Segredo compartilhado entre o agendador (pg_cron) e a função "avisos".
select vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'avisos_segredo', 'Chamada interna da função de avisos');

create function public.avisos_segredo()
returns text
language sql
stable
security definer
set search_path = public, vault
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'avisos_segredo' limit 1;
$$;
revoke execute on function public.avisos_segredo() from public, anon, authenticated;
grant execute on function public.avisos_segredo() to service_role;
