-- Tipo da carta: 'erro' (está errado de fato) ou 'natural' (não está errado, mas o nativo diria de outro jeito).
alter table public.cartas add column if not exists tipo text not null default 'erro' check (tipo in ('erro', 'natural'));
