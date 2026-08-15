-- Sino de notificações do aluno: guarda quando ele viu as novidades pela
-- última vez, pra saber o que é novo (material, tema do clube, tarefa do
-- planner) desde então. Default now() pra não inundar quem já tem conta
-- com "tudo é novidade" na primeira vez que essa coluna existir.

alter table public.profiles
  add column ultimo_acesso_novidades timestamptz not null default now();
