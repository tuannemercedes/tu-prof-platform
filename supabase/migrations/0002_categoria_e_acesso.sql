-- Adiciona categoria às matérias (trilha de aprendizagem vs ferramenta FIA)
-- e registro de "último acesso" ao progresso do aluno.

alter table public.materias
  add column categoria text not null default 'trilha' check (categoria in ('trilha', 'fia'));

alter table public.progresso
  add column acessado_em timestamptz;
