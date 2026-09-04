-- Categoria opcional pra organizar os termos do glossário (ex: UX,
-- Engenharia...) — texto livre, a mentora escolhe o nome que quiser.

alter table public.glossario_termos add column categoria text;
