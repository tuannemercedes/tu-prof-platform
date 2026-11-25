-- Nome do professor do aluno logado (o aluno não pode ler o perfil de outras
-- pessoas). Sem professor definido, mostra o nome da admin (fundadora).
create function public.meu_professor()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.nome from public.profiles a join public.profiles p on p.id = a.professor_id where a.id = auth.uid()),
    (select nome from public.profiles where role = 'admin' order by created_at limit 1)
  );
$$;
revoke execute on function public.meu_professor() from anon;
