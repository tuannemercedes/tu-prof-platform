-- Idioma em tudo que é do aluno (null = vale para os dois)
alter table public.aulas add column idioma text check (idioma in ('espanhol', 'ingles'));
alter table public.tarefas add column idioma text check (idioma in ('espanhol', 'ingles'));
alter table public.checkpoints add column idioma text check (idioma in ('espanhol', 'ingles'));
alter table public.plano_etapas add column idioma text check (idioma in ('espanhol', 'ingles'));

-- Acervo: FIA (praticar) e Biblioteca (estudar) separadas
alter table public.materias drop constraint materias_categoria_check;
alter table public.materias add constraint materias_categoria_check
  check (categoria in ('trilha', 'fia', 'biblioteca'));

-- Capa vinda de fora (miniatura do YouTube/Spotify)
alter table public.materiais add column capa_url text;
