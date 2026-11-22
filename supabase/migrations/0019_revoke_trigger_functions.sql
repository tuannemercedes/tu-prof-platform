-- Funções de gatilho não devem ser chamáveis pela API (/rest/v1/rpc).
-- Os gatilhos continuam funcionando normalmente.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_self_escalation() from public, anon, authenticated;
