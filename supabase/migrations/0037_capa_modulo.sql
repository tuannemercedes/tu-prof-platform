-- Capa (imagem) de cada módulo/matéria, mostrada na Trilha do aluno e no topo do módulo.
alter table public.materias add column if not exists capa_path text;
