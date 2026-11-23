-- Cada termo do glossário pertence a um idioma (ou aos dois)
alter table public.glossario_termos add column idioma text not null default 'espanhol'
  check (idioma in ('espanhol', 'ingles', 'espanhol_ingles'));
