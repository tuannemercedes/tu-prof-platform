-- Primeiro nome de quem comentou, gravado junto (o aluno não lê o perfil da equipe).
alter table public.missao_entregas add column comentario_nome text;
