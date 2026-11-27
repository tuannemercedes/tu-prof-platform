-- Cartas de frases e expressões: frente em português, verso no idioma.
alter table public.cartas drop constraint if exists cartas_tipo_check;
alter table public.cartas add constraint cartas_tipo_check check (tipo in ('erro', 'natural', 'expressao'));
