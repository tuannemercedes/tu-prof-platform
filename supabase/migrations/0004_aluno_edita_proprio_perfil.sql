-- Permite que o aluno atualize o próprio perfil (ex: nome).
-- O trigger abaixo impede que ele mude o próprio "role" mesmo que tente
-- manipular a requisição diretamente (só admin pode mudar role de alguém).

create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger before_profiles_update
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();
