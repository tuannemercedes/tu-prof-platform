-- Mentoria em dupla: duas pessoas, aulas juntas, cada uma com sua ficha.
--   profiles.dupla_com  a outra pessoa da dupla (os dois lados apontam um para o outro)
--   aulas.par_id        as duas aulas (uma de cada) da mesma aula em dupla têm o mesmo par_id
alter table public.profiles add column dupla_com uuid references public.profiles (id) on delete set null;
alter table public.aulas add column par_id uuid;
create index aulas_par_idx on public.aulas (par_id) where par_id is not null;
